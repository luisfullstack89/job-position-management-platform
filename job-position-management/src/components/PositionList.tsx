import React, { useEffect, useState } from 'react';
import { fetchPositions, deletePosition } from '../services/api';
import { Position } from '../interfaces/Position';
import { updatePosition } from '../services/api';
import './PositionForm.css'
import './PositionListForm.css'
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

const PositionList: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [search, setSearch] = useState('');
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const fetchAndSetPositions = async () => {
    const data = await fetchPositions();
    setPositions(data);
    setFilteredPositions(data);
  };
  useEffect(() => {
    const getPositions = async () => {
        fetchAndSetPositions();
    };
    getPositions();
    const handleSignalRMessage = (event: CustomEvent) => {
      console.log("SignalR update received:", event.detail);
      fetchAndSetPositions();
    };

    const signalrListener = (event: CustomEvent) => handleSignalRMessage(event);

    document.addEventListener('signalr-message', signalrListener as EventListener);

    return () => {
      document.removeEventListener('signalr-message', signalrListener as EventListener);
    };
  }, []);

  const handleDelete = async (id: number) => {
    console.log('delete is clicked')
    const confirmed = window.confirm('Are you sure you want to delete this position?');
  
    if (confirmed) {
      await deletePosition(id);
      setPositions(positions.filter(position => position.positionID !== id));
      fetchAndSetPositions();
    }
  };
  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    const filtered = positions.filter((position) => {
      const departmentName = departments.find(
        (dept) => dept.departmentId === position.departmentID
      )?.departmentName || '';
      const recruiterName = recruiters.find(
        (recruiter) => recruiter.recruiterID === position.recruiterID
      )?.recruiterName || '';
      const statusName = statuses.find(
        (status) => status.statusID === position.statusID
      )?.statusName || '';

      return (
        position.positionNumber.toLowerCase().includes(value) ||
        position.title.toLowerCase().includes(value) ||
        departmentName.toLowerCase().includes(value) ||
        recruiterName.toLowerCase().includes(value) ||
        statusName.toLowerCase().includes(value)
      );
    });

    setFilteredPositions(filtered);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsEditFormVisible(!isEditFormVisible);
  };
  const handleUpdate = async (updatedPosition: Position) => {
    console.log('update is clicked');
    try {
      if (selectedPosition) {
        await updatePosition(selectedPosition.positionID, updatedPosition);
  
        setSelectedPosition(null);
        setIsEditFormVisible(false);
  
        setPositions(
          positions.map((position) =>
            position.positionID === updatedPosition.positionID
              ? updatedPosition
              : position
          )
        );
        fetchAndSetPositions();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || 'An error occurred while updating the position.';
        console.error('Error:', errorMessage);
        alert(errorMessage); 
      } else {
        console.error('Error:', error);
        alert('An unexpected error occurred.');
      }
    }
  };
  
  
  return (
    <div>
      <h2>Job Positions</h2>
      <input
        type="text"
        value={search}
        onChange={handleSearch}
        placeholder="Search by Title, Department, or Recruiter"
      />
      <table>
        <thead>
          <tr>
            <th>Position Number</th>
            <th>Title</th>
            <th>Status</th>
            <th>Department</th>
            <th>Recruiter</th>
            <th>Budget</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPositions.map((position, index) => {
            const departmentName = departments.find(
              (dept) => dept.departmentId === position.departmentID
            )?.departmentName || '';
            const recruiterName = recruiters.find(
              (recruiter) => recruiter.recruiterID === position.recruiterID
            )?.recruiterName || '';
            const statusName = statuses.find(
              (status) => status.statusID === position.statusID
            )?.statusName || '';
            return (
              <tr key={position.positionID || index}>
                <td>{position.positionNumber}</td>
                <td>{position.title}</td>
                <td>{statusName}</td>
                <td>{departmentName}</td>
                <td>{recruiterName}</td>
                <td>{position.budget}</td>
                <td>
                  <button onClick={() => handleDelete(position.positionID)}>Delete</button>
                  <span>    </span>
                  <button onClick={() => handleEdit(position)}>
                    {isEditFormVisible && selectedPosition?.positionID === position.positionID ? 'Cancel' : 'Edit'}
                  </button>

                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isEditFormVisible && selectedPosition && (
        <PositionEditForm position={selectedPosition} onUpdate={handleUpdate} />
      )}

    </div>
  );
};

interface PositionEditFormProps {
  position: Position;
  onUpdate: (updatedPosition: Position) => void;
}

const PositionEditForm: React.FC<PositionEditFormProps> = ({ position, onUpdate }) => {
  const [formData, setFormData] = useState<Position>(position);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    onUpdate(formData);
  };

  return (
    <div className='position-form-container'>
        <form className='position-form' onSubmit={handleSubmit}>
      <h3>Edit Position</h3>
      <div>
        <label>Position Number</label>
        <input
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
          {recruiters.map((recruiter) => (
            <option key={recruiter.recruiterID} value={recruiter.recruiterID}>
              {recruiter.recruiterName}
            </option>
          ))}
        </select>
        {errors.recruiterID && <span>{errors.recruiterID}</span>}
      </div>

      <div>
        <label>Budget</label>
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
        />
        {errors.budget && <span>{errors.budget}</span>}
      </div>

      <button type="submit">Update</button>
    </form>
    </div>
    
  );
};

export default PositionList;
