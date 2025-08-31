import React, { useState, useEffect } from 'react';

// Subcontractor Assignment Modal
export const SubcontractorAssignmentModal = ({ 
  isOpen, 
  onClose, 
  packageId, 
  currentSubcontractors = [],
  onAssignSubcontractor,
  onRemoveSubcontractor 
}) => {
  const [availableSubcontractors, setAvailableSubcontractors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const tradeTypes = [
    'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Foundation', 
    'Framing', 'Drywall', 'Painting', 'Flooring', 'Landscaping',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSubcontractors();
    }
  }, [isOpen]);

  const fetchAvailableSubcontractors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subcontractors');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Filter out subcontractors already assigned to this package
        const assignedIds = currentSubcontractors.map(ps => ps.subcontractorId);
        const available = data.filter(sub => !assignedIds.includes(sub.id));
        setAvailableSubcontractors(available);
      } else {
        console.error('Invalid subcontractors data:', data);
        setAvailableSubcontractors([]);
      }
    } catch (error) {
      console.error('Failed to fetch subcontractors:', error);
      setAvailableSubcontractors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    
    if (!selectedSubcontractor || !tradeType) {
      alert('Please select both a subcontractor and trade type');
      return;
    }

    try {
      setIsAssigning(true);
      await onAssignSubcontractor(packageId, selectedSubcontractor, tradeType);
      
      // Reset form and refresh available subcontractors
      setSelectedSubcontractor('');
      setTradeType('');
      fetchAvailableSubcontractors();
      
      onClose();
    } catch (error) {
      console.error('Failed to assign subcontractor:', error);
      alert('Failed to assign subcontractor. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (subcontractorId) => {
    if (confirm('Are you sure you want to remove this subcontractor from the package?')) {
      try {
        await onRemoveSubcontractor(packageId, subcontractorId);
        // Refresh available subcontractors after removal
        fetchAvailableSubcontractors();
      } catch (error) {
        console.error('Failed to remove subcontractor:', error);
        alert('Failed to remove subcontractor. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Manage Package Subcontractors</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assign New Subcontractor */}
            <div className="space-y-4">
              <h4 className="font-semibold">Assign New Subcontractor</h4>
              
              <form onSubmit={handleAssign} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcontractor *</label>
                  <select
                    value={selectedSubcontractor}
                    onChange={(e) => setSelectedSubcontractor(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Subcontractor</option>
                    {availableSubcontractors.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        {sub.companyName} - {sub.tradeType}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type for This Package *</label>
                  <select
                    value={tradeType}
                    onChange={(e) => setTradeType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Trade Type</option>
                    {tradeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedSubcontractor || !tradeType}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? 'Assigning...' : 'Assign Subcontractor'}
                  </button>
                </div>
              </form>
            </div>

            {/* Current Package Subcontractors */}
            <div>
              <h4 className="font-semibold mb-4">Current Package Subcontractors</h4>
              
              {currentSubcontractors.length === 0 ? (
                <div className="text-center py-4 text-gray-500 border rounded-lg">
                  No subcontractors assigned to this package yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentSubcontractors.map((ps) => (
                    <div key={ps.id} className="border rounded-lg p-3 bg-blue-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{ps.subcontractor.companyName}</h5>
                          <p className="text-sm text-gray-600">Trade: {ps.tradeType}</p>
                          {ps.subcontractor.licenseNumber && (
                            <p className="text-sm text-gray-600">License: {ps.subcontractor.licenseNumber}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(ps.subcontractorId)}
                          className="text-red-500 hover:text-red-700 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {ps.subcontractor.phoneNumber && <p>Phone: {ps.subcontractor.phoneNumber}</p>}
                        {ps.subcontractor.email && <p>Email: {ps.subcontractor.email}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
