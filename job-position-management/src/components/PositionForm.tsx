import React, { useState } from 'react';
import { Position } from '../interfaces/Position';
import { createPosition, updatePosition } from '../services/api';
import './PositionForm.css'; 
import { signalRService } from '../services/signalRService';
import axios from 'axios';

const departments = [
  { departmentId: 1, departmentName: 'HR' },
  { departmentId: 2, departmentName: 'Engineering' },
  { departmentId: 3, departmentName: 'Sales' },
  { departmentId: 4, departmentName: 'Marketing' },
];

const recruiters = [
  { recruiterID: 1, recruiterName: 'Alice Johnson' },
  { recruiterID: 2, recruiterName: 'Bob Smith' },
  { recruiterID: 3, recruiterName: 'Charlie Davis' },
  { recruiterID: 4, recruiterName: 'Diana Lee' },
];

const statuses = [
  { statusID: 1, statusName: 'Employed' },
  { statusID: 2, statusName: 'Unemployed' },
];

interface Props {
  position?: Position;
  onSuccess: () => void;
}

const PositionForm: React.FC<Props> = ({ position, onSuccess }) => {
  const [formData, setFormData] = useState<Position>(
    position || {
      positionID: 0,
      positionNumber: '',
      title: '',
      statusID: 0,
      departmentID: 0,
      recruiterID: 0,
      budget: -1,
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Store form errors

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): boolean => {
    const validationErrors: { [key: string]: string } = {};

    if (!formData.positionNumber.trim()) {
      validationErrors.positionNumber = 'Position Number cannot be empty.';
    }

    if (formData.budget < 0) {
      validationErrors.budget = 'Budget must be non-negative.';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0; 
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('onsubmit is clicked');
  
    if (!validateForm()) return;
  
    try {
      if (position) {
        await updatePosition(position.positionID, formData);
        signalRService.connection.send("BroadcastPositionChange", "A position has been updated!");
      } else {
        await createPosition(formData);
        signalRService.connection.send("BroadcastPositionChange", "A new position has been created!");
      }
  
      onSuccess(); 
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || 'An error occurred while processing your request.';
        console.error('Error:', errorMessage);
        alert(errorMessage);  
      } else {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
      }
    }
  };
  

  return (
    <div className="position-form-container">
      <form className="position-form" onSubmit={handleSubmit}>
        <h3>{position ? 'Edit Position' : 'Create Position'}</h3>
        <div>
          <label htmlFor='positionNumber'>Position Number</label>
          <input
          id='positionNumber'
            type="number"
            name="positionNumber"
            value={formData.positionNumber}
            onChange={handleChange}
            
          />
          {errors.positionNumber && <span>{errors.positionNumber}</span>}
        </div>

        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            
          />
        </div>

        <div>
          <label>Status</label>
          <select
            name="statusID"
            value={formData.statusID}
            onChange={handleChange}
            
          >
            <option value="">Select Status</option>
            {statuses.map((status) => (
              <option key={status.statusID} value={status.statusID}>
                {status.statusName}
              </option>
            ))}
          </select>
          {errors.statusID && <span>{errors.statusID}</span>}
        </div>

        <div>
          <label>Department</label>
          <select
            name="departmentID"
            value={formData.departmentID}
            onChange={handleChange}
            
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </option>
            ))}
          </select>
          {errors.departmentID && <span>{errors.departmentID}</span>}
        </div>

        <div>
          <label>Recruiter</label>
          <select
            name="recruiterID"
            value={formData.recruiterID}
            onChange={handleChange}
            
          >
            <option value="">Select Recruiter</option>
            {recruiters.map((recruiter) => (
              <option key={recruiter.recruiterID} value={recruiter.recruiterID}>
                {recruiter.recruiterName}
              </option>
            ))}
          </select>
          {errors.recruiterID && <span>{errors.recruiterID}</span>}
        </div>

        <div>
          <label htmlFor='budget'>Budget</label>
          <input
          id='budget'
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            
          />
          {errors.budget && <span>{errors.budget}</span>}
        </div>

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default PositionForm;
