import React, { useState, useEffect } from 'react';

// Import the Florida county checklists data
import floridaChecklists from './florida-county-checklists.json';

// Florida counties array
const FLORIDA_COUNTIES = [
  "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "Santa Rosa", "Sarasota", "Seminole", "St. Johns", "St. Lucie", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
];

// Permit types
const PERMIT_TYPES = [
  "Mobile Home Permit",
  "Modular Home Permit", 
  "Shed Permit"
];

// Default checklist items for each permit type
const DEFAULT_CHECKLIST_ITEMS = {
  "Mobile Home Permit": [
    "Site Plan",
    "Foundation Design",
    "Manufacturer's Installation Instructions",
    "Electrical Permit",
    "Plumbing Permit",
    "HVAC Permit",
    "Soil Test Report",
    "Flood Zone Determination",
    "Property Survey",
    "Building Code Compliance Certificate"
  ],
  "Modular Home Permit": [
    "Site Plan",
    "Foundation Design",
    "Modular Unit Specifications",
    "Electrical Permit",
    "Plumbing Permit",
    "HVAC Permit",
    "Soil Test Report",
    "Flood Zone Determination",
    "Property Survey",
    "State Modular Program Approval",
    "Building Code Compliance Certificate"
  ],
  "Shed Permit": [
    "Site Plan",
    "Shed Design/Specifications",
    "Property Survey",
    "Flood Zone Determination",
    "Electrical Permit (if applicable)",
    "Plumbing Permit (if applicable)"
  ]
};

// Checklist Manager Class
class ChecklistManager {
  constructor() {
    this.storageKey = 'florida_county_checklists';
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.checklists = JSON.parse(stored);
      } else {
        // Initialize with the imported data
        this.checklists = floridaChecklists;
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error loading checklists from storage:', error);
      this.checklists = floridaChecklists;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.checklists));
    } catch (error) {
      console.error('Error saving checklists to storage:', error);
    }
  }

  getChecklist(county, permitType) {
    if (!this.checklists[county] || !this.checklists[county][permitType]) {
      return {
        items: [...DEFAULT_CHECKLIST_ITEMS[permitType]],
        customItems: [],
        lastModified: new Date().toISOString()
      };
    }
    return this.checklists[county][permitType];
  }

  updateChecklist(county, permitType, items, customItems = []) {
    if (!this.checklists[county]) {
      this.checklists[county] = {};
    }
    
    this.checklists[county][permitType] = {
      items: items || [...DEFAULT_CHECKLIST_ITEMS[permitType]],
      customItems: customItems || [],
      lastModified: new Date().toISOString()
    };
    
    this.saveToStorage();
  }

  addCustomItem(county, permitType, item) {
    const checklist = this.getChecklist(county, permitType);
    if (!checklist.customItems.includes(item)) {
      checklist.customItems.push(item);
      this.updateChecklist(county, permitType, checklist.items, checklist.customItems);
    }
  }

  removeCustomItem(county, permitType, item) {
    const checklist = this.getChecklist(county, permitType);
    const index = checklist.customItems.indexOf(item);
    if (index > -1) {
      checklist.customItems.splice(index, 1);
      this.updateChecklist(county, permitType, checklist.items, checklist.customItems);
    }
  }

  resetToDefault(county, permitType) {
    this.updateChecklist(county, permitType, [...DEFAULT_CHECKLIST_ITEMS[permitType]], []);
  }

  exportChecklist(county, permitType) {
    const checklist = this.getChecklist(county, permitType);
    const data = {
      county,
      permitType,
      checklist,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${county}_${permitType.replace(/\s+/g, '_')}_checklist.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importChecklist(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.county && data.permitType && data.checklist) {
            this.updateChecklist(data.county, data.permitType, data.checklist.items, data.checklist.customItems);
            resolve(data);
          } else {
            reject(new Error('Invalid checklist file format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  validateChecklistStructure(checklist) {
    return checklist && 
           Array.isArray(checklist.items) && 
           Array.isArray(checklist.customItems) && 
           checklist.lastModified;
  }
}

// Create a global instance
const checklistManager = new ChecklistManager();

// Icon Components
const CheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const PlusIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Main Checklist Management Modal Component
export const ChecklistManagementModal = ({ isOpen, onClose }) => {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedPermitType, setSelectedPermitType] = useState('');
  const [currentChecklist, setCurrentChecklist] = useState(null);
  const [newCustomItem, setNewCustomItem] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && selectedCounty && selectedPermitType) {
      loadChecklist();
    }
  }, [isOpen, selectedCounty, selectedPermitType]);

  const loadChecklist = () => {
    if (selectedCounty && selectedPermitType) {
      const checklist = checklistManager.getChecklist(selectedCounty, selectedPermitType);
      setCurrentChecklist(checklist);
    }
  };

  const handleCountyChange = (county) => {
    setSelectedCounty(county);
    setCurrentChecklist(null);
  };

  const handlePermitTypeChange = (permitType) => {
    setSelectedPermitType(permitType);
    setCurrentChecklist(null);
  };

  const handleAddCustomItem = () => {
    if (newCustomItem.trim() && selectedCounty && selectedPermitType) {
      checklistManager.addCustomItem(selectedCounty, selectedPermitType, newCustomItem.trim());
      setNewCustomItem('');
      loadChecklist();
      setMessage('Custom item added successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRemoveCustomItem = (item) => {
    if (selectedCounty && selectedPermitType) {
      checklistManager.removeCustomItem(selectedCounty, selectedPermitType, item);
      loadChecklist();
      setMessage('Custom item removed successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleResetToDefault = () => {
    if (selectedCounty && selectedPermitType) {
      if (confirm('Are you sure you want to reset this checklist to default? This will remove all custom items.')) {
        checklistManager.resetToDefault(selectedCounty, selectedPermitType);
        loadChecklist();
        setMessage('Checklist reset to default successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleExport = () => {
    if (selectedCounty && selectedPermitType) {
      try {
        checklistManager.exportChecklist(selectedCounty, selectedPermitType);
        setMessage('Checklist exported successfully!');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage('Export failed: ' + error.message);
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        await checklistManager.importChecklist(file);
        setMessage('Checklist imported successfully!');
        setTimeout(() => setMessage(''), 3000);
        // Reload current checklist if it matches the imported one
        if (currentChecklist) {
          loadChecklist();
        }
      } catch (error) {
        setMessage('Import failed: ' + error.message);
        setTimeout(() => setMessage(''), 3000);
      } finally {
        setIsLoading(false);
      }
    }
    // Reset the input
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">Florida County Checklist Management</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select County
              </label>
              <select
                value={selectedCounty}
                onChange={(e) => handleCountyChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a county...</option>
                {FLORIDA_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Permit Type
              </label>
              <select
                value={selectedPermitType}
                onChange={(e) => handlePermitTypeChange(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedCounty}
              >
                <option value="">Choose permit type...</option>
                {PERMIT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-md mb-4 ${
              message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          {/* Checklist Display */}
          {currentChecklist && (
            <div className="space-y-6">
              {/* Standard Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3 text-gray-800">
                  Standard Requirements
                </h4>
                <div className="space-y-2">
                  {currentChecklist.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckIcon className="text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Requirements */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-3 text-blue-800">
                  Custom Requirements
                </h4>
                
                {/* Add Custom Item */}
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newCustomItem}
                    onChange={(e) => setNewCustomItem(e.target.value)}
                    placeholder="Add custom requirement..."
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomItem()}
                  />
                  <button
                    onClick={handleAddCustomItem}
                    disabled={!newCustomItem.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    <PlusIcon />
                    <span>Add</span>
                  </button>
                </div>

                {/* Custom Items List */}
                <div className="space-y-2">
                  {currentChecklist.customItems.length === 0 ? (
                    <p className="text-gray-500 italic">No custom requirements added yet.</p>
                  ) : (
                    currentChecklist.customItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <span className="text-blue-700">{item}</span>
                        <button
                          onClick={() => handleRemoveCustomItem(item)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <XIcon />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleResetToDefault}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Export Checklist
                </button>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer">
                  Import Checklist
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>

              {/* Last Modified Info */}
              <div className="text-sm text-gray-500">
                Last modified: {new Date(currentChecklist.lastModified).toLocaleString()}
              </div>
            </div>
          )}

          {/* Instructions */}
          {!currentChecklist && (
            <div className="text-center text-gray-500 py-12">
              <h4 className="text-lg font-medium mb-2">Select a County and Permit Type</h4>
              <p>Choose a county and permit type above to view and manage the checklist.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistManagementModal;
