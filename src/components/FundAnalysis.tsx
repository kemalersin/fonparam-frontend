import React, { useEffect } from 'react';

const FundAnalysis: React.FC = () => {
    const [showMonthlyDetails, setShowMonthlyDetails] = React.useState(false);

    useEffect(() => {
        localStorage.setItem('showMonthlyDetails', JSON.stringify(showMonthlyDetails));
        
        if (showMonthlyDetails) {
            setTimeout(() => {
                const element = document.getElementById('monthly-details-table');
                if (element) {
                    const yOffset = -100; // Üst menü için offset
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 100);
        }
    }, [showMonthlyDetails]);

    return (
        // Rest of the component code remains unchanged
    );
};

export default FundAnalysis; 