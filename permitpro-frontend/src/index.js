import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import JSZip from 'jszip';
import './styles.css';
import ChecklistManagementModal from './checklist-system';
import { ContractorManagementModal, SubcontractorManagementModal } from './contractor-management';
import { SubcontractorAssignmentModal } from './subcontractor-assignment-modal';

// --- API HELPERS ---
// Get API base URL from environment variable or default to localhost
const API_BASE_URL = ''; // same-origin; nginx proxies /api to backendt API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  put: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  postFormData: async (url, formData) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  delete: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};

const FLORIDA_COUNTIES = [
  "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "Santa Rosa", "Sarasota", "Seminole", "St. Johns", "St. Lucie", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
];

const PERMIT_TYPES = [
  "Mobile Home Permit",
  "Modular Home Permit", 
  "Shed Permit"
];

// --- ICONS ---
const FileIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const PlusCircleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const LogOutIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const UploadCloudIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
    </svg>
);
const XIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const DownloadIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

// --- UI COMPONENTS ---
function Card({ children, className = '' }) {
  return <div className={`modern-card ${className}`}>{children}</div>;
}
const CardHeader = ({ children, className = '' }) => <div className={`modern-card-header ${className}`}>{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`modern-card-content ${className}`}>{children}</div>;
const CardFooter = ({ children, className = '' }) => <div className={`modern-card-footer ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-xl font-bold leading-tight tracking-tight text-gray-900 ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-600 mt-1 ${className}`}>{children}</p>;
const Button = ({ children, onClick, className = '', variant = 'primary', size = 'default', ...props }) => {
  const baseClasses = "modern-btn focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = { 
    default: "h-11 px-6 py-2.5", 
    sm: "h-9 px-4 py-2 text-sm", 
    xs: "h-8 px-3 py-1.5 text-xs",
    lg: "h-12 px-8 py-3 text-base"
  };
  const variantClasses = { 
    primary: "modern-btn-primary focus:ring-blue-500", 
    secondary: "modern-btn-secondary focus:ring-gray-500", 
    success: "modern-btn-success focus:ring-green-500",
    warning: "modern-btn-warning focus:ring-yellow-500",
    error: "modern-btn-error focus:ring-red-500",
    outline: "modern-btn-secondary focus:ring-gray-500"
  };
  return (
    <button onClick={onClick} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
const Input = ({ className = '', ...props }) => (
  <input
    className={`modern-input ${className}`}
    {...props}
  />
);
const Select = ({ children, className = '', ...props }) => (
    <select
        className={`modern-select ${className}`}
        {...props}
    >
        {children}
    </select>
);
const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-semibold text-gray-700 mb-2 ${className}`}>
    {children}
  </label>
);
const Table = ({ children, className = '' }) => <div className={`w-full overflow-auto rounded-lg ${className}`}><table className="modern-table">{children}</table></div>;
const TableHeader = ({ children, className = '' }) => <thead className={className}>{children}</thead>;
const TableBody = ({ children, className = '' }) => <tbody className={className}>{children}</tbody>;
const TableRow = ({ children, className = '', ...props }) => <tr className={className} {...props}>{children}</tr>;
const TableHead = ({ children, className = '' }) => <th className={className}>{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={className}>{children}</td>;

const Badge = ({ children, status }) => {
  const statusClasses = {
    Draft: "modern-badge modern-badge-draft",
    Submitted: "modern-badge modern-badge-submitted",
    Completed: "modern-badge modern-badge-completed",
  };
  return (
    <span className={`${statusClasses[status] || 'modern-badge bg-gray-100 text-gray-800 border-gray-200'}`}>
      {children}
    </span>
  );
};

const Modal = ({ children, isOpen, onClose, size = "lg" }) => {
    if (!isOpen) return null;
    
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg", 
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-6xl"
    };
    
    return (
        <div className="modern-modal-overlay" onClick={onClose}>
            <div className={`modern-modal w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
                <div className="p-8 overflow-y-auto max-h-full">
                    {children}
                </div>
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
                    aria-label="Close modal"
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

// --- APPLICATION COMPONENTS ---

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await api.post('/api/auth/login', { email, password });
      onLogin(user);
    } catch (err) {
      setError('Invalid email or password.');
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">📋</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome to PermitPro</h2>
          <p className="mt-2 text-sm text-gray-600">Professional Permit Management System</p>
        </div>
        
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@permitpro.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="text-base"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="modern-loading mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure permit management for professionals
          </p>
        </div>
      </div>
    </div>
  );
};

const CreatePackageModal = ({ isOpen, onClose, onPackageCreate, contractors }) => {
    const [customerName, setCustomerName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [county, setCounty] = useState(FLORIDA_COUNTIES[0]);
    const [permitType, setPermitType] = useState(PERMIT_TYPES[0]);
    const [contractorLicense, setContractorLicense] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newPackageData = {
                customerName,
                propertyAddress,
                county,
                permitType,
                contractorLicense: contractorLicense || null,
            };
            await onPackageCreate(newPackageData);
            
            setCustomerName('');
            setPropertyAddress('');
            setCounty(FLORIDA_COUNTIES[0]);
            setPermitType(PERMIT_TYPES[0]);
            setContractorLicense('');
            onClose();
        } catch (error) {
            console.error("Failed to create package:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlusCircleIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Create New Permit Package</CardTitle>
                <CardDescription className="text-gray-600 mt-2">Fill in the details below to start a new package.</CardDescription>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-sm font-medium text-gray-700">Customer Name *</Label>
                        <Input 
                            id="customerName" 
                            value={customerName} 
                            onChange={e => setCustomerName(e.target.value)} 
                            required 
                            className="w-full"
                            placeholder="Enter customer name"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="county" className="text-sm font-medium text-gray-700">County *</Label>
                        <Select 
                            id="county" 
                            value={county} 
                            onChange={e => setCounty(e.target.value)}
                            className="w-full"
                        >
                            {FLORIDA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="propertyAddress" className="text-sm font-medium text-gray-700">Property Address *</Label>
                    <Input 
                        id="propertyAddress" 
                        value={propertyAddress} 
                        onChange={e => setPropertyAddress(e.target.value)} 
                        required 
                        className="w-full"
                        placeholder="Enter full property address"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="permitType" className="text-sm font-medium text-gray-700">Permit Type *</Label>
                        <Select 
                            id="permitType" 
                            value={permitType} 
                            onChange={e => setPermitType(e.target.value)}
                            className="w-full"
                        >
                            {PERMIT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="contractorLicense" className="text-sm font-medium text-gray-700">Primary Contractor</Label>
                        <Select 
                            id="contractorLicense" 
                            value={contractorLicense} 
                            onChange={e => setContractorLicense(e.target.value)}
                            className="w-full"
                        >
                            <option value="">Select Contractor (Optional)</option>
                            {contractors.map(contractor => (
                                <option key={contractor.licenseNumber} value={contractor.licenseNumber}>
                                    {contractor.companyName} - {contractor.licenseNumber}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        size="lg"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        variant="primary"
                        size="lg"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="modern-loading mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Package'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

const UploadDocumentModal = ({ isOpen, onClose, onDocumentUpload, packageId }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('document', file);

        try {
            await onDocumentUpload(packageId, formData);
            setFile(null);
            onClose();
        } catch (err) {
            console.error("Failed to upload document:", err);
            setError('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Select a file to add to package {packageId}.</CardDescription>
            <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloudIcon className="w-10 h-10 mb-3 text-gray-400" />
                            {file ? (
                                <p className="font-semibold text-gray-600">{file.name}</p>
                            ) : (
                                <>
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG (MAX. 10MB)</p>
                                </>
                            )}
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// PermitPackageDetails component will be defined inside App component

// PDF Viewer Modal Component
const PDFViewerModal = ({ isOpen, onClose, pdfUrl, fileName }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <CardTitle>View Document: {fileName}</CardTitle>
                        <CardDescription>View the document directly on the website</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <a 
                            href={pdfUrl} 
                            download={fileName}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Download
                        </a>
                        <Button onClick={onClose} variant="outline">Close</Button>
                    </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                    <iframe 
                        src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`} 
                        width="100%" 
                        height="600px" 
                        title={fileName}
                        className="border-0"
                    />
                </div>
            </div>
        </Modal>
    );
};

// FIXED: Single unified App component
const App = () => {
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isChecklistModalOpen, setChecklistModalOpen] = useState(false);
  const [isContractorModalOpen, setContractorModalOpen] = useState(false);
  const [isSubcontractorModalOpen, setSubcontractorModalOpen] = useState(false);
  const [isSubcontractorAssignmentModalOpen, setSubcontractorAssignmentModalOpen] = useState(false);
  const [isContractorSelectionModalOpen, setContractorSelectionModalOpen] = useState(false);
  const [contractors, setContractors] = useState([]);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/api/permits');
      setPackages(data);
    } catch (err) {
      setError('Failed to load permit packages.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      const data = await api.get('/api/contractors');
      setContractors(data);
    } catch (err) {
      console.error('Failed to load contractors:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPackages();
      fetchContractors();
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setPackages([]);
    setSelectedPackageId(null);
  };

  const handleCreatePackage = async (newPackageData) => {
    try {
        await api.post('/api/permits', newPackageData);
        fetchPackages();
    } catch (error) {
        console.error("Failed to create package:", error);
        throw error;
    }
  };

  const handleUpdatePackage = async (packageId, updateData) => {
    try {
        const updatedPackage = await api.put(`/api/permits/${packageId}`, updateData);
        setPackages(prevPackages => prevPackages.map(p => p.id === packageId ? updatedPackage : p));
    } catch (error) {
        console.error("Failed to update package:", error);
    }
  };

  const handleContractorCreate = async (contractorData) => {
    try {
      await api.post('/api/contractors', contractorData);
    } catch (error) {
      console.error("Failed to create contractor:", error);
      throw error;
    }
  };

  const handleContractorUpdate = async (contractorId, updateData) => {
    try {
      await api.put(`/api/contractors/${contractorId}`, updateData);
    } catch (error) {
      console.error("Failed to update contractor:", error);
      throw error;
    }
  };

  const handleSubcontractorCreate = async (subcontractorData) => {
    try {
      await api.post(`/api/subcontractors`, subcontractorData);
    } catch (error) {
      console.error("Failed to create subcontractor:", error);
      throw error;
    }
  };

  const handleSubcontractorUpdate = async (subcontractorId, updateData) => {
    try {
      await api.put(`/api/subcontractors/${subcontractorId}`, updateData);
    } catch (error) {
      console.error("Failed to update subcontractor:", error);
      throw error;
    }
  };

  const handleContractorDelete = async (contractorId) => {
    try {
      await api.delete(`/api/contractors/${contractorId}`);
      
      // Refresh contractors list after successful deletion
      fetchContractors();
    } catch (error) {
      console.error("Failed to delete contractor:", error);
      
      // Handle specific error for contractors with assigned packages
      if (error.message && error.message.includes('Cannot delete contractor with assigned packages')) {
        const errorData = error.response?.data || {};
        const packageCount = errorData.packageCount || 0;
        
        if (packageCount > 0) {
          const reassign = confirm(
            `${errorData.message}\n\nWould you like to reassign all packages to a different contractor before deletion?`
          );
          
          if (reassign) {
            // Show contractor selection for reassignment
            const newContractorId = prompt(
              `Enter the ID of the contractor to reassign ${packageCount} package(s) to:\n\nAvailable contractors:\n${contractors
                .filter(c => c.id !== contractorId)
                .map(c => `${c.id}: ${c.companyName}`)
                .join('\n')}`
            );
            
            if (newContractorId && newContractorId.trim()) {
              try {
                await handleReassignPackages(contractorId, parseInt(newContractorId.trim()));
                // Now try to delete the contractor again
                await api.delete(`/api/contractors/${contractorId}`);
                fetchContractors();
                fetchPackages(); // Refresh packages to show updated assignments
                alert('Packages reassigned and contractor deleted successfully!');
              } catch (reassignError) {
                console.error("Failed to reassign packages:", reassignError);
                alert('Failed to reassign packages. Contractor not deleted.');
              }
            }
          }
        } else {
          alert(`Cannot delete this contractor: ${errorData.message}`);
        }
      } else {
        alert('Failed to delete contractor. Please try again.');
      }
      
      throw error;
    }
  };

  const handleReassignPackages = async (oldContractorId, newContractorId) => {
    try {
      const response = await api.put(`/api/contractors/${oldContractorId}/reassign-packages`, {
        newContractorId
      });
      
      return response;
    } catch (error) {
      console.error("Failed to reassign packages:", error);
      throw error;
    }
  };

  const handleSubcontractorDelete = async (subcontractorId) => {
    try {
      await api.delete(`/api/subcontractors/${subcontractorId}`);
    } catch (error) {
      console.error("Failed to delete subcontractor:", error);
      throw error;
    }
  };

  const handleAssignSubcontractor = async (packageId, subcontractorId, tradeType) => {
    try {
      await api.post(`/api/permits/${packageId}/subcontractors`, {
        subcontractorId: parseInt(subcontractorId),
        tradeType
      });
      
      // Refresh packages to get updated subcontractor list
      fetchPackages();
    } catch (error) {
      console.error("Failed to assign subcontractor:", error);
      throw error;
    }
  };

  const handleRemoveSubcontractor = async (packageId, subcontractorId) => {
    try {
      await api.delete(`/api/permits/${packageId}/subcontractors/${subcontractorId}`);
      
      // Refresh packages to get updated subcontractor list
      fetchPackages();
    } catch (error) {
      console.error("Failed to remove subcontractor:", error);
      throw error;
    }
  };

  const handleAssignContractor = async (packageId, contractorLicense) => {
    try {
      const updatedPackage = await api.put(`/api/permits/${packageId}/contractor`, {
        contractorLicense
      });
      
      // Update the packages list with the new contractor assignment
      setPackages(prevPackages => 
        prevPackages.map(p => p.id === packageId ? updatedPackage : p)
      );
      
      // Update selected package if it's the current one
      if (selectedPackageId === packageId) {
        setSelectedPackageId(packageId); // This will trigger a re-fetch
      }
    } catch (error) {
      console.error("Failed to assign contractor:", error);
      throw error;
    }
  };

  const handleDocumentUpload = async (packageId, formData) => {
    try {
        const updatedPackage = await api.postFormData(`/api/permits/${packageId}/documents`, formData);
        setPackages(prevPackages => prevPackages.map(p => p.id === packageId ? updatedPackage : p));
    } catch (error) {
        console.error("Failed to upload document:", error);
        throw error;
    }
  };

  const filteredPackages = useMemo(() => {
    if (!filter) return packages;
    return packages.filter(p =>
      p.customerName.toLowerCase().includes(filter.toLowerCase()) ||
      p.propertyAddress.toLowerCase().includes(filter.toLowerCase()) ||
      p.permitType.toLowerCase().includes(filter.toLowerCase()) ||
      p.id.toString().includes(filter)
    );
  }, [packages, filter]);

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) return null;
    return packages.find(p => p.id === selectedPackageId);
  }, [packages, selectedPackageId]);

  // PermitPackageDetails component defined inside App component
  const PermitPackageDetails = ({ package: permitPackage, onUpdate, onDocumentUpload, onSubcontractorCreate, onSubcontractorUpdate, isSubcontractorAssignmentModalOpen, setSubcontractorAssignmentModalOpen }) => {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isPDFViewerOpen, setPDFViewerOpen] = useState(false);
    const [selectedPDF, setSelectedPDF] = useState(null);


    if (!permitPackage) {
        return (
            <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <FileIcon className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Package Selected</h3>
                    <p className="text-gray-500 max-w-sm">Select a permit package from the list to view its details, manage documents, and track progress.</p>
                </CardContent>
            </Card>
        );
    }

    const handleStatusChange = async (newStatus) => {
        try {
            await onUpdate(permitPackage.id, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const openPDFViewer = (doc) => {
        setSelectedPDF({
            url: `/uploads/${doc.filePath}`,
            fileName: doc.fileName
        });
        setPDFViewerOpen(true);
    };

    const closePDFViewer = () => {
        setPDFViewerOpen(false);
        setSelectedPDF(null);
    };

    const removeSubcontractor = async (packageId, subcontractorId) => {
        if (confirm('Are you sure you want to remove this subcontractor from the package?')) {
            try {
                await fetch(`/api/permits/${packageId}/subcontractors/${subcontractorId}`, {
                    method: 'DELETE'
                });
                // Refresh the package data
                window.location.reload();
            } catch (error) {
                console.error('Failed to remove subcontractor:', error);
            }
        }
    };

    const downloadAllDocuments = (documents) => {
        if (documents.length === 0) {
            alert('No documents to download.');
            return;
        }

        const zip = new JSZip();
        const downloadPromises = documents.map(async (doc) => {
            const response = await fetch(`/uploads/${doc.filePath}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch document ${doc.fileName}: ${response.statusText}`);
            }
            const blob = await response.blob();
            zip.file(doc.fileName, blob);
        });

        Promise.all(downloadPromises)
            .then(() => zip.generateAsync({ type: "blob" }))
            .then(content => {
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `package_${permitPackage.id}_documents.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error("Failed to download documents:", error);
                alert(`Download failed: ${error.message}`);
            });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl text-blue-900">Package #{permitPackage.id}</CardTitle>
                        <CardDescription className="text-blue-700 mt-1">
                            {permitPackage.customerName} • {permitPackage.propertyAddress}
                        </CardDescription>
                    </div>
                    <Badge status={permitPackage.status}>{permitPackage.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-8">
                <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Package Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">County</label>
                                <p className="text-gray-900 font-medium">{permitPackage.county}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Permit Type</label>
                                <p className="text-gray-900 font-medium">{permitPackage.permitType}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Created Date</label>
                                <p className="text-gray-900 font-medium">{new Date(permitPackage.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="text-gray-900 font-medium">{new Date(permitPackage.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contractor Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Contractor Information
                    </h4>
                    {permitPackage.contractor ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h5 className="text-lg font-semibold text-green-900">{permitPackage.contractor.companyName}</h5>
                                    <p className="text-sm text-green-700 font-medium">License: {permitPackage.contractor.licenseNumber}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => setSubcontractorAssignmentModalOpen(true)} 
                                        size="sm" 
                                        variant="secondary"
                                    >
                                        Manage Subcontractors
                                    </Button>
                                    <Button 
                                        onClick={() => setContractorSelectionModalOpen(true)} 
                                        size="sm" 
                                        variant="outline"
                                    >
                                        Change
                                    </Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <label className="text-green-600 font-medium">Address</label>
                                    <p className="text-green-800">{permitPackage.contractor.address}</p>
                                </div>
                                <div>
                                    <label className="text-green-600 font-medium">Phone</label>
                                    <p className="text-green-800">{permitPackage.contractor.phoneNumber}</p>
                                </div>
                                {permitPackage.contractor.email && (
                                    <div>
                                        <label className="text-green-600 font-medium">Email</label>
                                        <p className="text-green-800">{permitPackage.contractor.email}</p>
                                    </div>
                                )}
                                {permitPackage.contractor.contactPerson && (
                                    <div>
                                        <label className="text-green-600 font-medium">Contact Person</label>
                                        <p className="text-green-800">{permitPackage.contractor.contactPerson}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-yellow-800 font-medium">No contractor assigned to this package</span>
                                </div>
                                <Button 
                                    onClick={() => setContractorSelectionModalOpen(true)} 
                                    size="sm" 
                                    variant="warning"
                                >
                                    Assign Contractor
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Subcontractors List */}
                {permitPackage.subcontractors && permitPackage.subcontractors.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold">Subcontractors</h4>
                        <div className="space-y-2">
                            {permitPackage.subcontractors.map((ps) => (
                                <div key={ps.id} className="border rounded-lg p-3 bg-blue-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h5 className="font-medium">{ps.subcontractor.companyName}</h5>
                                            <p className="text-sm text-gray-600">Trade: {ps.tradeType}</p>
                                        </div>
                                        <button
                                            onClick={() => removeSubcontractor(permitPackage.id, ps.subcontractor.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
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
                    </div>
                )}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Documents
                        </h4>
                        <div className="flex gap-2">
                            {permitPackage.documents && permitPackage.documents.length > 0 && (
                                <Button 
                                    onClick={() => downloadAllDocuments(permitPackage.documents)} 
                                    size="sm" 
                                    variant="success"
                                >
                                    <DownloadIcon className="w-4 h-4 mr-2" />
                                    Download All
                                </Button>
                            )}
                            <Button onClick={() => setUploadModalOpen(true)} size="sm" variant="primary">
                                <PlusCircleIcon className="w-4 h-4 mr-2" />
                                Upload Document
                            </Button>
                        </div>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Document</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead>Uploader</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permitPackage.documents && permitPackage.documents.length > 0 ? (
                                    permitPackage.documents.map(doc => (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                <button 
                                                    onClick={() => openPDFViewer(doc)}
                                                    className="text-blue-600 hover:underline flex items-center"
                                                >
                                                    <FileIcon className="w-4 h-4 mr-2" />
                                                    <span>{doc.fileName}</span>
                                                </button>
                                            </TableCell>
                                            <TableCell>{doc.version}</TableCell>
                                            <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{doc.uploaderName}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="4" className="text-center py-4 text-gray-500">No documents uploaded yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">
                            Update package status to track progress through the permit process
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            onClick={() => handleStatusChange('Draft')} 
                            disabled={permitPackage.status === 'Draft'}
                            size="sm"
                        >
                            Set to Draft
                        </Button>
                        <Button 
                            variant="primary" 
                            onClick={() => handleStatusChange('Submitted')} 
                            disabled={permitPackage.status === 'Submitted'}
                            size="sm"
                        >
                            Submit Package
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={() => handleStatusChange('Completed')} 
                            disabled={permitPackage.status === 'Completed'}
                            size="sm"
                        >
                            Complete Package
                        </Button>
                    </div>
                </div>
            </CardFooter>
            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                packageId={permitPackage.id}
                onDocumentUpload={onDocumentUpload}
            />
            <PDFViewerModal
                isOpen={isPDFViewerOpen}
                onClose={closePDFViewer}
                pdfUrl={selectedPDF?.url}
                fileName={selectedPDF?.fileName}
            />
            <SubcontractorAssignmentModal
                isOpen={isSubcontractorAssignmentModalOpen}
                onClose={() => setSubcontractorAssignmentModalOpen(false)}
                packageId={permitPackage.id}
                currentSubcontractors={permitPackage.subcontractors || []}
                onAssignSubcontractor={handleAssignSubcontractor}
                onRemoveSubcontractor={handleRemoveSubcontractor}
            />
        </Card>
    );
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      <header className="modern-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PermitPro</h1>
                <p className="text-sm text-gray-600">Professional Permit Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button onClick={() => setChecklistModalOpen(true)} variant="secondary" size="sm">
                  <FileIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Checklist</span>
                </Button>
                <Button onClick={() => setContractorModalOpen(true)} variant="secondary" size="sm">
                  <FileIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Contractors</span>
                </Button>
                <Button onClick={() => setSubcontractorModalOpen(true)} variant="secondary" size="sm">
                  <FileIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Subcontractors</span>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-blue-600">{packages.length}</div>
              <div className="text-sm text-blue-700 font-medium">Total Packages</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {packages.filter(p => p.status === 'Completed').length}
              </div>
              <div className="text-sm text-green-700 font-medium">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {packages.filter(p => p.status === 'Draft').length}
              </div>
              <div className="text-sm text-yellow-700 font-medium">In Progress</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Permit Packages</CardTitle>
                  <CardDescription>Manage and track all permit packages in your system</CardDescription>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Input
                      placeholder="Search packages..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full sm:w-64 pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <Button onClick={() => setCreateModalOpen(true)} size="lg">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    New Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan="6" className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="modern-loading mb-4"></div>
                            <p className="text-gray-500">Loading packages...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : error ? (
                       <TableRow>
                        <TableCell colSpan="6" className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <p className="text-red-600 font-medium">{error}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredPackages.length > 0 ? (
                      filteredPackages.map((pkg) => (
                        <TableRow 
                          key={pkg.id} 
                          onClick={() => setSelectedPackageId(pkg.id)} 
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedPackageId === pkg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                          }`}
                        >
                          <TableCell className="font-semibold text-blue-600">#{pkg.id}</TableCell>
                          <TableCell className="font-medium">{pkg.customerName}</TableCell>
                          <TableCell className="text-gray-600">{pkg.propertyAddress}</TableCell>
                          <TableCell className="text-gray-600">{pkg.permitType}</TableCell>
                          <TableCell><Badge status={pkg.status}>{pkg.status}</Badge></TableCell>
                          <TableCell className="text-gray-500">{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="6" className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="text-gray-500 font-medium">No packages found</p>
                            <p className="text-gray-400 text-sm">Create your first package to get started</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div>
            <PermitPackageDetails
              package={selectedPackage}
              onUpdate={handleUpdatePackage}
              onDocumentUpload={handleDocumentUpload}
              onSubcontractorCreate={handleSubcontractorCreate}
              onSubcontractorUpdate={handleSubcontractorUpdate}
              isSubcontractorAssignmentModalOpen={isSubcontractorAssignmentModalOpen}
              setSubcontractorAssignmentModalOpen={setSubcontractorAssignmentModalOpen}
            />
          </div>
        </div>
        <CreatePackageModal 
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onPackageCreate={handleCreatePackage}
            contractors={contractors}
        />
        <ChecklistManagementModal
            isOpen={isChecklistModalOpen}
            onClose={() => setChecklistModalOpen(false)}
        />
        <ContractorManagementModal
            isOpen={isContractorModalOpen}
            onClose={() => setContractorModalOpen(false)}
            onContractorCreate={handleContractorCreate}
            onContractorUpdate={handleContractorUpdate}
            onContractorDelete={handleContractorDelete}
        />
        <SubcontractorManagementModal
            isOpen={isSubcontractorModalOpen}
            onClose={() => setSubcontractorModalOpen(false)}
            onSubcontractorCreate={handleSubcontractorCreate}
            onSubcontractorUpdate={handleSubcontractorUpdate}
            onSubcontractorDelete={handleSubcontractorDelete}
        />
            
            {/* Contractor Selection Modal */}
            {isContractorSelectionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-96 max-h-96 flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Select Contractor</h3>
                            <button onClick={() => setContractorSelectionModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        
                        <div className="flex-1 p-4 overflow-auto">
                            <div className="space-y-2">
                                {contractors.map((contractor) => (
                                    <div key={contractor.id} className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h5 className="font-medium">{contractor.companyName}</h5>
                                                <p className="text-sm text-gray-600">License: {contractor.licenseNumber}</p>
                                                <p className="text-xs text-gray-500">{contractor.address}</p>
                                            </div>
                                                                                          <Button 
                                                  onClick={() => {
                                                      handleAssignContractor(selectedPackage.id, contractor.licenseNumber);
                                                      setContractorSelectionModalOpen(false);
                                                  }}
                                                size="sm"
                                                variant="outline"
                                            >
                                                Select
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
      </main>
    </div>
  );
};

// Render the App
ReactDOM.render(<App />, document.getElementById('root'));
