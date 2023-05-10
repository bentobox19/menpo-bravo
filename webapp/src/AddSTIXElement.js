import React, { useState } from 'react';

function RightPanel() {
  const [forms, setForms] = useState([]);

  const addForm = () => {
    setForms([...forms, { id: Date.now() }]);
  };

  return (
    <div>
      <h3>Add STIX Element</h3>
      <button onClick={addForm}>Add</button>
      {forms.map((form) => (
        <StixIndicatorForm key={form.id} />
      ))}
    </div>
  );
}

function StixIndicatorForm() {
  const [indicator, setIndicator] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Use axios to send data to the Django backend
    // axios.post('your-api-url', { indicator });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="indicator">STIX Indicator:</label>
      <input
        type="text"
        name="indicator"
        value={indicator}
        onChange={(e) => setIndicator(e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default RightPanel;
