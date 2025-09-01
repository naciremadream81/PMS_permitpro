import React, { useState, useEffect } from 'react';

// Contractor Management Modal
export const ContractorManagementModal = ({ isOpen, onClose, onContractorCreate, onContractorUpdate, onContractorDelete }) => {
  const [contractors, setContractors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    licenseNumber: '',
    address: '',
    phoneNumber: '',
    email: '',
    contactPerson: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchContractors();
    }
  }, [isOpen]);

  const fetchContractors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/contractors');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setContractors(data);
      } else {
        console.error('Invalid contractors data:', data);
        setContractors([]);
      }
    } catch (error) {
      console.error('Failed to fetch contractors:', error);
      setContractors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode && selectedContractor) {
        await onContractorUpdate(selectedContractor.id, formData);
      } else {
        await onContractorCreate(formData);
      }
      
      resetForm();
      fetchContractors();
    } catch (error) {
      console.error('Failed to save contractor:', error);
    }
  };

  const handleEdit = (contractor) => {
    setSelectedContractor(contractor);
    setFormData({
      companyName: contractor.companyName,
      licenseNumber: contractor.licenseNumber,
      address: contractor.address,
      phoneNumber: contractor.phoneNumber,
      email: contractor.email || '',
      contactPerson: contractor.contactPerson || ''
    });
    setIsEditMode(true);
  };

  const handleDelete = async (contractorId) => {
    if (confirm('Are you sure you want to delete this contractor?')) {
      try {
        if (onContractorDelete) {
          await onContractorDelete(contractorId);
        } else {
          await fetch(`/api/contractors/${contractorId}`, { method: 'DELETE' });
        }
        fetchContractors();
      } catch (error) {
        console.error('Failed to delete contractor:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      licenseNumber: '',
      address: '',
      phoneNumber: '',
      email: '',
      contactPerson: ''
    });
    setSelectedContractor(null);
    setIsEditMode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Contractor Management</h3>
            <p className="text-gray-600 mt-1">Manage contractors and their information</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contractor Form */}
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-gray-900">{isEditMode ? 'Edit Contractor' : 'Add New Contractor'}</h4>
                <p className="text-gray-600 mt-1">{isEditMode ? 'Update contractor information' : 'Create a new contractor record'}</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter full address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter contact person name"
                  />
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      `${isEditMode ? 'Update' : 'Add'} Contractor`
                    )}
                  </button>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Contractor List */}
            <div>
              <h4 className="font-semibold mb-4">Existing Contractors</h4>
              
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading contractors...</div>
              ) : !contractors || !Array.isArray(contractors) ? (
                <div className="text-center py-4 text-red-500">Error loading contractors. Please try again.</div>
              ) : contractors.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No contractors found. Create your first contractor above.</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {contractors.map((contractor) => (
                    <div key={contractor.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{contractor.companyName}</h5>
                          <p className="text-sm text-gray-600">License: {contractor.licenseNumber}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(contractor)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(contractor.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{contractor.address}</p>
                        <p>Phone: {contractor.phoneNumber}</p>
                        {contractor.email && <p>Email: {contractor.email}</p>}
                        {contractor.contactPerson && <p>Contact: {contractor.contactPerson}</p>}
                        <p>Packages: {contractor.packages?.length || 0}</p>
                        <p>Subcontractors: {contractor.subcontractors?.length || 0}</p>
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

// Global Subcontractor Management Modal
export const SubcontractorManagementModal = ({ isOpen, onClose, onSubcontractorCreate, onSubcontractorUpdate, onSubcontractorDelete }) => {
  const [subcontractors, setSubcontractors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    licenseNumber: '',
    address: '',
    phoneNumber: '',
    email: '',
    contactPerson: '',
    tradeType: ''
  });

  const tradeTypes = [
    'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Foundation', 
    'Framing', 'Drywall', 'Painting', 'Flooring', 'Landscaping',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      fetchSubcontractors();
    }
  }, [isOpen]);

  const fetchSubcontractors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/subcontractors');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSubcontractors(data);
      } else {
        console.error('Invalid subcontractors data:', data);
        setSubcontractors([]);
      }
    } catch (error) {
      console.error('Failed to fetch subcontractors:', error);
      setSubcontractors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode && selectedSubcontractor) {
        await onSubcontractorUpdate(selectedSubcontractor.id, formData);
      } else {
        await onSubcontractorCreate(formData);
      }
      
      resetForm();
      fetchSubcontractors();
    } catch (error) {
      console.error('Failed to save subcontractor:', error);
    }
  };

  const handleEdit = (subcontractor) => {
    setSelectedSubcontractor(subcontractor);
    setFormData({
      companyName: subcontractor.companyName,
      licenseNumber: subcontractor.licenseNumber || '',
      address: subcontractor.address || '',
      phoneNumber: subcontractor.phoneNumber || '',
      email: subcontractor.email || '',
      contactPerson: subcontractor.contactPerson || '',
      tradeType: subcontractor.tradeType
    });
    setIsEditMode(true);
  };

  const handleDelete = async (subcontractorId) => {
    if (confirm('Are you sure you want to delete this subcontractor?')) {
      try {
        if (onSubcontractorDelete) {
          await onSubcontractorDelete(subcontractorId);
        } else {
          await fetch(`/api/subcontractors/${subcontractorId}`, { method: 'DELETE' });
        }
        fetchSubcontractors();
      } catch (error) {
        console.error('Failed to delete subcontractor:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      licenseNumber: '',
      address: '',
      phoneNumber: '',
      email: '',
      contactPerson: '',
      tradeType: ''
    });
    setSelectedSubcontractor(null);
    setIsEditMode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Subcontractor Management</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subcontractor Form */}
            <div className="space-y-4">
              <h4 className="font-semibold">{isEditMode ? 'Edit Subcontractor' : 'Add New Subcontractor'}</h4>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade Type *</label>
                  <select
                    value={formData.tradeType}
                    onChange={(e) => setFormData({...formData, tradeType: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Trade Type</option>
                    {tradeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isEditMode ? 'Update' : 'Create'} Subcontractor
                  </button>
                  
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Subcontractor List */}
            <div>
              <h4 className="font-semibold mb-4">Existing Subcontractors</h4>
              
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Loading subcontractors...</div>
              ) : !subcontractors || !Array.isArray(subcontractors) ? (
                <div className="text-center py-4 text-red-500">Error loading subcontractors. Please try again.</div>
              ) : subcontractors.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No subcontractors found. Create your first subcontractor above.</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subcontractors.map((subcontractor) => (
                    <div key={subcontractor.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium">{subcontractor.companyName}</h5>
                          <p className="text-sm text-gray-600">Trade: {subcontractor.tradeType}</p>
                          {subcontractor.licenseNumber && (
                            <p className="text-sm text-gray-600">License: {subcontractor.licenseNumber}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(subcontractor)}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(subcontractor.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        {subcontractor.address && <p>{subcontractor.address}</p>}
                        {subcontractor.phoneNumber && <p>Phone: {subcontractor.phoneNumber}</p>}
                        {subcontractor.email && <p>Email: {subcontractor.email}</p>}
                        {subcontractor.contactPerson && <p>Contact: {subcontractor.contactPerson}</p>}
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
