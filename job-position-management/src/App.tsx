import React, { useState } from 'react';
import PositionList from './components/PositionList';
import PositionForm from './components/PositionForm';
import './App.css'; // Import the CSS file for styling

const App: React.FC = () => {
  const [isFormVisible, setFormVisible] = useState(false);

  const toggleForm = () => {
    setFormVisible(!isFormVisible);
  };

  const handleSuccess = () => {
    setFormVisible(false);
  };

  return (
    <>
    <div className="whole-app">
    <div className="app-container">
      <h1>Job Positions Management</h1>
      <button onClick={toggleForm}>{isFormVisible ? 'Cancel' : 'Add Position'}</button>
      {isFormVisible && <PositionForm onSuccess={handleSuccess} />}
      <div className="position-list-container">
        <PositionList />
      </div>
    </div>
    </div>
    </>
  );
};

export default App;
