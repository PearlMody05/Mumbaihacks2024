import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setResponseData(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error uploading file. Please try again.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>CSV File Upload</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {responseData && (
        <div style={{ marginTop: '20px' }}>
          <h2>Visualizations:</h2>
          {responseData.image_paths.length > 0 ? (
            responseData.image_paths.map((imagePath, index) => (
              <img
                key={index}
                src={imagePath}
                alt={`Visualization ${index + 1}`}
                style={{ width: '300px', margin: '10px' }}
              />
            ))
          ) : (
            <p>No visualizations generated.</p>
          )}

          <h2>Textual Analysis:</h2>
          {responseData.textual_analysis.length > 0 ? (
            responseData.textual_analysis.map((item, index) => (
              <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <h3>{item.product_name}</h3>
                <p>{item.analysis}</p>
              </div>
            ))
          ) : (
            <p>No textual analysis available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
