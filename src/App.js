import React from 'react';
import FileUpload from './components/FileUpload';
import CalculationForm from './components/calculate/CalculationForm';
import ExportGroup from './components/ExportGroup';
import DeleteGroup from './components/DeleteGroup';
import './styles/global.css'

function App() {
  return (
      <div>
          <h1>Плюшка<span className="hidden-hyphen">-</span>Калькулятор</h1>
          <FileUpload/>
          <CalculationForm/>
          <ExportGroup/>
          <DeleteGroup/>
      </div>
  );
}

export default App;
