import { useState } from 'react';
import * as XLSX from 'xlsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [scanHistory, setScanHistory] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [formData, setFormData] = useState({
    operator: '',
    sensorSerial: '',
    packageSerial: ''
  });

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundImage: "url('/LightBackground.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  const navStyle = {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '1rem'
  };

  const navContentStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative'
  };

  const lastScannedStyle = {
    padding: '0.5rem 1rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const mainContentStyle = {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem',
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    outline: 'none'
  };

  const buttonBaseStyle = {
    width: '100%',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    marginBottom: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    background: '#1E1656',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonBaseStyle,
    background: 'white',
    border: '1px solid #e2e8f0',
    color: '#1E1656'
  };

  const alertStyle = (type) => ({
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    backgroundColor: type === 'error' ? '#FEE2E2' : '#DCFCE7',
    color: type === 'error' ? '#DC2626' : '#059669',
    display: alert.show ? 'block' : 'none'
  });

  // Functions
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const handleKeyPress = (e, next) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (next) {
        document.getElementById(next).focus();
      } else {
        verifySerial();
      }
    }
  };

  const verifySerial = () => {
    if (!formData.operator) {
      showAlert('Please enter operator name', 'error');
      return;
    }

    if (!formData.sensorSerial || !formData.packageSerial) {
      showAlert('Please scan both serials', 'error');
      return;
    }

    const match = formData.sensorSerial.substring(0, 10) === formData.packageSerial.substring(0, 10);
    
    setScanHistory([...scanHistory, {
      ...formData,
      timestamp: new Date(),
      match
    }]);

    showAlert(match ? 'Serials match!' : 'Serials do not match!', match ? 'success' : 'error');

    setFormData({
      ...formData,
      sensorSerial: '',
      packageSerial: ''
    });

    document.getElementById('sensorSerial').focus();
  };

  const exportToExcel = () => {
    if (scanHistory.length === 0) {
      showAlert('No data to export', 'error');
      return;
    }

    if (window.confirm('Are you sure you want to export the current scan history?')) {
      const data = scanHistory.map(scan => ({
        'Date': new Date(scan.timestamp).toLocaleDateString(),
        'Time': new Date(scan.timestamp).toLocaleTimeString(),
        'Operator': scan.operator,
        'Sensor Serial': scan.sensorSerial,
        'Package Serial': scan.packageSerial,
        'Match': scan.match ? 'Yes' : 'No'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Scan History');

      const fileName = `scan_history_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      showAlert('Export successful!', 'success');
    }
  };

  const startNewScanning = () => {
    if (scanHistory.length === 0 || window.confirm('Are you sure you want to start new scanning? This will clear all current records.')) {
      setScanHistory([]);
      setFormData({
        operator: '',
        sensorSerial: '',
        packageSerial: ''
      });
      document.getElementById('operator').focus();
      showAlert('Started new scanning session', 'success');
    }
  };

  return (
    <div style={containerStyle}>
      <nav style={navStyle}>
        <div style={navContentStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/biobeatlogo.png" alt="BioBeat Logo" style={{ height: '60px' }} />
          </div>
          <div style={lastScannedStyle}>
            <strong>Last Scanned: </strong>
            <span>{scanHistory.length > 0 ? scanHistory[scanHistory.length - 1].packageSerial : '-'}</span>
          </div>
        </div>
      </nav>

      <div style={mainContentStyle}>
        {/* Stats Panel */}
        <div style={{ 
          background: 'white',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          height: 'fit-content'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: '600' }}>Total Scans Today</div>
            <div style={{ fontSize: '1.5rem', color: '#00b8e8', fontWeight: '700' }}>{scanHistory.length}</div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: '600' }}>Success Rate</div>
            <div style={{ fontSize: '1.5rem', color: '#00b8e8', fontWeight: '700' }}>
              {scanHistory.length > 0 ? 
                Math.round((scanHistory.filter(s => s.match).length / scanHistory.length) * 100) : 0}%
            </div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '1rem', marginBottom: '0.25rem', fontWeight: '600' }}>Last Scan</div>
            <div style={{ fontSize: '1.5rem', color: '#00b8e8', fontWeight: '700' }}>
              {scanHistory.length > 0 ? 
                new Date(scanHistory[scanHistory.length - 1].timestamp).toLocaleTimeString() : '--:--'}
            </div>
          </div>
        </div>

        {/* Scanner Interface */}
        <div>
        <div style={cardStyle}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Operator Name</label>
              <input
                id="operator"
                type="text"
                value={formData.operator}
                onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, 'sensorSerial')}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Sensor Serial</label>
              <input
                id="sensorSerial"
                type="text"
                value={formData.sensorSerial}
                onChange={(e) => setFormData({ ...formData, sensorSerial: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, 'packageSerial')}
                placeholder="Scan sensor serial"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Package Serial</label>
              <input
                id="packageSerial"
                type="text"
                value={formData.packageSerial}
                onChange={(e) => setFormData({ ...formData, packageSerial: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, null)}
                placeholder="Scan package serial"
                style={inputStyle}
              />
            </div>

            <div style={{ 
              height: '100px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '1rem 0',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: scanHistory.length > 0 
                ? (scanHistory[scanHistory.length - 1].match ? '#ECFDF5' : '#FEF2F2')
                : 'transparent'
            }}>
              {scanHistory.length > 0 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: scanHistory[scanHistory.length - 1].match ? '#059669' : '#DC2626',
                    marginBottom: '0.5rem'
                  }}>
                    {scanHistory[scanHistory.length - 1].match ? 'Serials Match!' : 'Serials do not match!'}
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    color: scanHistory[scanHistory.length - 1].match ? '#059669' : '#DC2626'
                  }}>
                    {scanHistory[scanHistory.length - 1].match 
                      ? 'The sensor and package serials are matching' 
                      : 'Please check the serial numbers and try again'}
                  </div>
                </div>
              )}
            </div>

            <button onClick={verifySerial} style={{
              ...primaryButtonStyle,
              fontWeight: '600'
            }}>
              Verify
            </button>
            <button onClick={exportToExcel} style={{
              ...secondaryButtonStyle,
              fontWeight: '600'
            }}>
              Export Results
            </button>
            <button onClick={startNewScanning} style={{
              ...secondaryButtonStyle,
              fontWeight: '600'
            }}>
              Start New Scanning
            </button>
          </div>

          {/* Scan History Table */}
          <div style={{ ...cardStyle, marginTop: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b' }}>Time</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b' }}>Operator</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b' }}>Sensor Serial</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b' }}>Package Serial</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#64748b' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {scanHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      No scans recorded
                    </td>
                  </tr>
                ) : (
                  [...scanHistory].reverse().map((scan, index) => (
                    <tr key={index}>
                      <td style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>{scan.operator}</td>
                      <td style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>{scan.sensorSerial}</td>
                      <td style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>{scan.packageSerial}</td>
                      <td style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          backgroundColor: scan.match ? '#ECFDF5' : '#FEF2F2',
                          color: scan.match ? '#059669' : '#DC2626'
                        }}>
                          {scan.match ? 'Match' : 'No Match'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;