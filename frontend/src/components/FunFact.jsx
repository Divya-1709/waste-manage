import React, { useState, useEffect } from 'react';

const FunFact = () => {
  const facts = [
    "Recycling one ton of paper saves 17 trees.",
    "The average person generates about 4 pounds of trash per day.",
    "Plastic takes up to 500 years to decompose.",
    "Composting can reduce methane emissions from landfills.",
    "Glass can be recycled endlessly without loss of quality."
  ];

  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 5000); // Change fact every 5 seconds

    return () => clearInterval(interval);
  }, [facts.length]);

  return (
    <div style={styles.container}>
      <h3>Fun Fact</h3>
      <p>{facts[currentFact]}</p>
    </div>
  );
};

const styles = {
  container: {
    background: '#f1f8f6',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    margin: '20px 0',
  },
};

export default FunFact;
