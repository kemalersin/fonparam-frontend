## SpecStory

## Inflation Page Input Modification (2/14/2025, 11:17:41 AM)

_**User**_

Inflation sayfasını incele. "Para Miktarı" input'unun değeri tamamen silinemiyor. Silinebilsin ama değer yoksa API'den veri çekilmesin.

---

_**Assistant**_

Merhaba! Bu sorunu çözmek için `handleAmountChange` fonksiyonunu ve ilgili state yönetimini güncelleyelim. İşte gerekli değişiklikler:

```typescript:src/pages/Inflation.tsx
// ... existing code ...

// Amount değişikliğini yönet
const handleAmountChange = (value: string) => {
    // Boş string kontrolü ekleyelim
    if (value === '') {
        setDebouncedAmount(0);
        return;
    }

    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
        setDebouncedAmount(newAmount);
    }
};

// ... existing code ...

// API'den enflasyon verilerini çek - amount kontrolü ekleyelim
const { data: inflationData, isLoading } = useInflation(amount > 0 ? startDate : null);

// Enflasyon etkisini hesapla
const calculateRealValue = () => {
    // Amount 0 veya boş ise boş array dön
    if (!amount || !inflationData) return [];

    // ... existing code ...
};

// ... existing code ...

// Input'un value prop'unu güncelleyelim
<input
    type="number"
    name="amount"
    id="amount"
    value={debouncedAmount || ''}
    onChange={(e) => handleAmountChange(e.target.value)}
    placeholder={defaultAmount.toString()}
    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
/>

// ... existing code ...
```

Bu değişikliklerle:

1. `handleAmountChange` fonksiyonunda boş string kontrolü eklendi ve bu durumda amount'u 0'a set ediyoruz
2. Input'un value prop'unda `debouncedAmount || ''` kullanarak 0 değerinin boş string olarak görüntülenmesini sağladık
3. useInflation hook'una amount kontrolü ekleyerek, amount 0 veya boş olduğunda API çağrısı yapılmamasını sağladık
4. calculateRealValue fonksiyonunda amount kontrolü ekleyerek, amount 0 veya boş olduğunda boş array dönmesini sağladık

Bu değişikliklerle artık:
- Para miktarı input'u tamamen silinebilecek
- Input boş olduğunda API'ye istek atılmayacak
- Input boş olduğunda grafik ve tablo gösterilmeyecek
- Geçerli bir değer girildiğinde normal işleyiş devam edecek

---

_**User**_

Amount 0 ise URL'de yazmamalı.

---

_**Assistant**_

URL güncelleme kısmında amount kontrolünü güncelleyelim:

```typescript:src/pages/Inflation.tsx
// ... existing code ...

// URL'yi güncelle
useEffect(() => {
    const newParams = new URLSearchParams();
    
    // Sadece varsayılan değerlerden farklı olan parametreleri ekle
    // Amount 0'dan büyükse ve varsayılan değerden farklıysa ekle
    if (amount > 0 && amount !== defaultAmount) {
        newParams.set('amount', amount.toString());
    }
    if (selectedYear !== defaultDate.getFullYear()) {
        newParams.set('year', selectedYear.toString());
    }
    if (selectedMonth.value !== defaultDate.getMonth() + 1) {
        newParams.set('month', selectedMonth.value.toString());
    }
    if (showNominal !== true) {
        newParams.set('nominal', showNominal.toString());
    }

    // Eğer hiç parametre yoksa URL'yi temizle
    const params = newParams.toString();
    setSearchParams(params ? newParams : {});
}, [amount, selectedYear, selectedMonth, showNominal]);

// ... existing code ...
```

Bu değişiklikle:
- Amount değeri 0 olduğunda URL'de gösterilmeyecek
- Amount değeri 0'dan büyük ve varsayılan değerden farklı olduğunda URL'de gösterilecek
- Diğer parametrelerin davranışı aynı kalacak

---

_**User**_

Input;'un içini sıfırlarsam, sayfada o anki veriyi sıfırlamamalı.

---

_**Assistant**_

Anladım. Yani input boş olduğunda API çağrısı ve hesaplamalar son geçerli değer ile devam etmeli. Bunun için `debouncedAmount` ve `amount` state'lerini ayrı tutmalıyız:

```typescript:src/pages/Inflation.tsx
// ... existing code ...

// Amount değişikliğini yönet
const handleAmountChange = (value: string) => {
    // Input boş ise sadece görüntüyü güncelle
    if (value === '') {
        setDebouncedAmount(null);
        return;
    }

    const newAmount = Number(value);
    if (!isNaN(newAmount) && newAmount >= 0) {
        setDebouncedAmount(newAmount);
    }
};

// Debounced amount için useEffect
useEffect(() => {
    const timer = setTimeout(() => {
        // Sadece geçerli bir değer varsa amount'u güncelle
        if (debouncedAmount !== null) {
            setAmount(debouncedAmount);
        }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
}, [debouncedAmount]);

// ... existing code ...

// State tanımlamalarını güncelle
const [amount, setAmount] = useState(initialAmount);
const [debouncedAmount, setDebouncedAmount] = useState<number | null>(initialAmount);

// ... existing code ...

// Input value prop'unu güncelle
<input
    type="number"
    name="amount"
    id="amount"
    value={debouncedAmount ?? ''} // null ise boş string göster
    onChange={(e) => handleAmountChange(e.target.value)}
    placeholder={defaultAmount.toString()}
    className="block w-full rounded-md border-0 py-2.5 pl-7 pr-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
/>

// ... existing code ...
```

Bu değişikliklerle:
1. `debouncedAmount` state'i artık `number | null` tipinde olacak
2. Input boş olduğunda `debouncedAmount` null olacak ama `amount` değişmeyecek
3. Input'a yeni bir değer girildiğinde ve bu değer geçerli olduğunda `amount` güncellenecek
4. Böylece input boş olduğunda hesaplamalar ve API çağrıları son geçerli değer ile devam edecek

---

_**User**_

Değer Değişimi başlığının sağındaki değerler mobilde alt satıra geçmeli.

---

_**Assistant**_

Değer Değişimi başlığının olduğu kısmı mobilde daha iyi görüntülenmesi için düzenleyelim:

```typescript:src/pages/Inflation.tsx
// ... existing code ...

{/* Chart */}
{chartData.length > 0 && (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Değer Değişimi</h2>
            {chartData.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300">
                        {formatCurrency(showNominal ? chartData[0].nominalValue : chartData[0].realValue)}
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">→</div>
                    <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        (showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue) >= 
                        (showNominal ? chartData[0].nominalValue : chartData[0].realValue)
                            ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}>
                        {formatCurrency(showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue)}
                    </div>
                    <div className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        (showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue) >= 
                        (showNominal ? chartData[0].nominalValue : chartData[0].realValue)
                            ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                            : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                    }`}>
                        {formatPercent(((showNominal ? chartData[chartData.length - 1].nominalValue : chartData[chartData.length - 1].realValue) /
                            (showNominal ? chartData[0].nominalValue : chartData[0].realValue) - 1) * 100)}
                    </div>
                </div>
            )}
        </div>
        <div className="h-96">
            {/* ... existing chart code ... */}
        </div>
    </div>
)}

// ... existing code ...
```

Yapılan değişiklikler:
1. Üst kısımdaki `flex` container'a `flex-col sm:flex-row` ekledik
2. `items-center` yerine `items-start sm:items-center` kullandık
3. Değerler kısmına `flex-wrap` ekledik
4. Container'a `gap-4` ekledik

Bu değişikliklerle:
- Mobilde başlık ve değerler alt alta görünecek
- Değerler kendi içinde sığmadığında alt satıra geçecek
- Desktop'ta yan yana görünmeye devam edecek
- Öğeler arasında uygun boşluklar olacak

---

_**User**_

Değer Değişimi grafiğinin sol tarafındaki boşluk çok fazka.

---

_**Assistant**_



YAxis'in genişliğini azaltalım ve sol taraftaki boşluğu düzenleyelim:

```typescript:src/pages/Inflation.tsx
// ... existing code ...

<ResponsiveContainer width="100%" height="100%">
    <LineChart 
        data={chartData}
        margin={{ left: 0, right: 8, top: 8, bottom: 8 }} // Margin'leri düzenle
    >
        <CartesianGrid strokeDasharray="3 3" className="text-gray-200 dark:text-gray-700" />
        <XAxis 
            dataKey="date" 
            className="text-gray-600 dark:text-gray-300"
            tickFormatter={(date) => {
                return new Date(date).toLocaleDateString('tr-TR', {
                    month: 'short',
                    year: 'numeric'
                });
            }}
        />
        <YAxis
            className="text-gray-600 dark:text-gray-300"
            domain={['auto', 'auto']}
            width={65} // Genişliği azalt
            tickFormatter={(value) => {
                if (value >= 1_000_000) {
                    return (value / 1_000_000).toLocaleString('tr-TR') + 'M';
                } else if (value >= 1_000) {
                    return (value / 1_000).toLocaleString('tr-TR') + 'B';
                }
                return value.toLocaleString('tr-TR');
            }}
        />
        <Tooltip
            // ... existing tooltip props ...
        />
        {/* ... existing lines ... */}
    </LineChart>
</ResponsiveContainer>

// ... existing code ...
```

Yapılan değişiklikler:
1. `YAxis` genişliğini 80'den 65'e düşürdük
2. `LineChart` bileşenine `margin` prop'u ekledik ve sol boşluğu 0'a ayarladık

Bu değişikliklerle grafik sol tarafa daha yakın olacak ve gereksiz boşluk azalacaktır.

---

_**User**_

Soldaki boşluğu biraz daha azaltabiliriz.

---

_**Assistant**_

YAxis'in genişliğini biraz daha azaltalım ve margin'i düzenleyelim:

```typescript:src/pages/Inflation.tsx
<LineChart 
    data={chartData}
    margin={{ left: -15, right: 8, top: 8, bottom: 8 }}
>
    {/* ... */}
    <YAxis
        className="text-gray-600 dark:text-gray-300"
        domain={['auto', 'auto']}
        width={55}
        tickFormatter={(value) => {
            if (value >= 1_000_000) {
                return (value / 1_000_000).toLocaleString('tr-TR') + 'M';
            } else if (value >= 1_000) {
                return (value / 1_000).toLocaleString('tr-TR') + 'B';
            }
            return value.toLocaleString('tr-TR');
        }}
    />
    {/* ... */}
</LineChart>
```

Değişiklikler:
1. YAxis genişliğini 65'ten 55'e düşürdük
2. LineChart'ın left margin'ini 0'dan -15'e düşürdük

Bu değişikliklerle sol taraftaki boşluk daha da azalacaktır.

---

_**User**_

Birazcık arttıralım.

---

_**Assistant**_



YAxis genişliğini ve margin'i biraz artıralım:

```typescript:src/pages/Inflation.tsx
<LineChart 
    data={chartData}
    margin={{ left: -10, right: 8, top: 8, bottom: 8 }}
>
    {/* ... */}
    <YAxis
        className="text-gray-600 dark:text-gray-300"
        domain={['auto', 'auto']}
        width={60}
        tickFormatter={(value) => {
            if (value >= 1_000_000) {
                return (value / 1_000_000).toLocaleString('tr-TR') + 'M';
            } else if (value >= 1_000) {
                return (value / 1_000).toLocaleString('tr-TR') + 'B';
            }
            return value.toLocaleString('tr-TR');
        }}
    />
    {/* ... */}
</LineChart>
```

Değişiklikler:
1. YAxis genişliğini 55'ten 60'a çıkardık
2. LineChart'ın left margin'ini -15'ten -10'a çıkardık

Bu değişikliklerle sol taraftaki boşluk biraz daha dengeli olacaktır.

---

_**User**_

Çok az, azıcık daha...

---

_**Assistant**_



---



---

