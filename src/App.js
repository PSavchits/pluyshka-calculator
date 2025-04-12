import React from 'react';
import FileUpload from './components/FileUpload';
import CalculationForm from './components/CalculationForm';
import ExportGroup from './components/ExportGroup';
import DeleteGroup from './components/DeleteGroup';

function App() {
  return (
      <div>
          <h1>Плюшка-Калькулятор</h1>
          <FileUpload/>
          <CalculationForm/>
          <ExportGroup/>
          <DeleteGroup/>
      </div>
  );
}

export default App;
