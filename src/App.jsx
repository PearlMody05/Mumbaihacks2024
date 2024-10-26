import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setResponseData(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    setProgress(30);

    try {
      const response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }

      setProgress(70);
      const data = await response.json();
      setResponseData(data);
      setProgress(100);
      setError(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Error uploading file. Please try again.');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>S2S- stocks to sales</h1>
        <p style={styles.subtitle}>
          Gather Insights about your data
        </p>
      </header>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Upload Your CSV File</h2>
        <p style={styles.cardDescription}>
          Choose a CSV file and click the button below to analyze your data.
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          style={styles.fileInput}
        />
        <button
          onClick={handleUpload}
          style={{
            ...styles.uploadButton,
            ...(loading || !file ? styles.uploadButtonDisabled : {}),
          }}
          disabled={loading || !file}
        >
          {loading ? 'Uploading...' : 'Upload & Analyze'}
        </button>

        <div style={styles.progressContainer}>
          {progress > 0 && (
            <div style={{ ...styles.progressBar, width: `${progress}%` }}>
              {progress}%
            </div>
          )}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {responseData && (
          <div style={styles.results}>
            <h2 style={styles.resultsTitle}>Results</h2>
            <div style={styles.visualizations}>
              {responseData.image_paths.length > 0 ? (
                responseData.image_paths.map((imagePath, index) => (
                  <div key={index} style={styles.imageWrapper}>
                    <img
                      src={imagePath}
                      alt={`Visualization ${index + 1}`}
                      style={styles.image}
                    />
                    <div style={styles.tooltip}>Visualization {index + 1}</div>
                  </div>
                ))
              ) : (
                <p style={styles.noData}>No visualizations generated.</p>
              )}
            </div>

            <h3 style={styles.analysisTitle}>Textual Analysis</h3>
            <div style={styles.textContainer}>
              {responseData.textual_analysis.length > 0 ? (
                responseData.textual_analysis.map((item, index) => (
                  <div key={index} style={styles.textItem}>
                    <h4 style={styles.productName}>{item.product_name}</h4>
                    <p style={styles.analysisText}>{item.analysis}</p>
                  </div>
                ))
              ) : (
                <p style={styles.noData}>No textual analysis available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    background: 'linear-gradient(120deg, #84fab0, #8fd3f4)',
    padding: '40px 20px',
    textAlign: 'center',
    color: '#ffffff',
    width: '100%',
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '300',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)',
    maxWidth: '750px',
    width: '90%',
    marginTop: '-30px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#333',
  },
  cardDescription: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '25px',
  },
  fileInput: {
    display: 'block',
    margin: '0 auto 20px',
    fontSize: '16px',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #ddd',
    cursor: 'pointer',
  },
  uploadButton: {
    backgroundColor: '#6C63FF',
    color: '#ffffff',
    border: 'none',
    padding: '12px 32px',
    fontSize: '18px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  progressContainer: {
    height: '10px',
    backgroundColor: '#ddd',
    borderRadius: '5px',
    marginTop: '15px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6C63FF',
    color: '#fff',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '5px',
    transition: 'width 0.3s ease',
  },
  error: {
    color: '#e74c3c',
    fontSize: '16px',
    marginTop: '15px',
    fontWeight: '500',
  },
  results: {
    textAlign: 'left',
    marginTop: '30px',
  },
  resultsTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  visualizations: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginTop: '10px',
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  image: {
    width: '100%',
    height: 'auto',
  },
  tooltip: {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '12px',
  },
  analysisTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    marginTop: '30px',
  },
  textContainer: {
    marginTop: '20px',
  },
  textItem: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    transition: 'background-color 0.3s ease',
  },
  productName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#6C63FF',
  },
  analysisText: {
    fontSize: '14px',
    color: '#555',
  },
  noData: {
    fontStyle: 'italic',
    color: '#999',
  },
};

export default App;
