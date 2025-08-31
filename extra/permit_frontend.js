import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';

// --- API HELPERS ---
const api = {
  get: async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  post: async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  put: async (url, data) => {
    const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  postFormData: async (url, formData) => {
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};

const FLORIDA_COUNTIES = [
  "Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "Santa Rosa", "Sarasota", "Seminole", "St. Johns", "St. Lucie", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"
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

// --- UI COMPONENTS ---
function Card({ children, className = '' }) {
  return <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>{children}</div>;
}
const CardHeader = ({ children, className = '' }) => <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 ${className}`}>{children}</div>;
const CardFooter = ({ children, className = '' }) => <div className={`p-6 pt-0 border-t border-gray-200 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children, className = '' }) => <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
const Button = ({ children, onClick, className = '', variant = 'default', size = 'default', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const sizeClasses = { default: "h-10 px-4 py-2", sm: "h-9 px-3 py-1.5 text-xs", xs: "h-8 px-2 py-1 text-xs" };
  const variantClasses = { default: "bg-gray-900 text-white hover:bg-gray-800", destructive: "bg-red-600 text-white hover:bg-red-700", outline: "bg-transparent border border-gray-300 hover:bg-gray-100", ghost: "bg-transparent hover:bg-gray-100", };
  return (
    <button onClick={onClick} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
const Input = ({ className = '', ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);
const Select = ({ children, className = '', ...props }) => (
    <select
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
    >
        {children}
    </select>
);
const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
    {children}
  </label>
);
const Table = ({ children, className = '' }) => <div className={`w-full overflow-auto ${className}`}><table className="w-full caption-bottom text-sm">{children}</table></div>;
const TableHeader = ({ children, className = '' }) => <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
const TableBody = ({ children, className = '' }) => <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
const TableRow = ({ children, className = '', ...props }) => <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`} {...props}>{children}</tr>;
const TableHead = ({ children, className = '' }) => <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={`p-4 align-middle ${className}`}>{children}</td>;

const Badge = ({ children, status }) => {
  const statusClasses = {
    Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Submitted: "bg-blue-100 text-blue-800 border-blue-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {children}
    </span>
  );
};

const Modal = ({ children, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    {children}
                </div>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

// --- APPLICATION COMPONENTS ---

/**
 * LoginPage Component
 * Handles user authentication.
 */
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to PermitPro</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="admin@permitpro.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="password123" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/**
 * CreatePackageModal Component
 * A modal form for creating a new permit package.
 */
const CreatePackageModal = ({ isOpen, onClose, onPackageCreate }) => {
    const [customerName, setCustomerName] = useState('');
    const [propertyAddress, setPropertyAddress] = useState('');
    const [county, setCounty] = useState(FLORIDA_COUNTIES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newPackageData = {
                customerName,
                propertyAddress,
                county,
            };
            await onPackageCreate(newPackageData);
            
            // Reset form and close on success
            setCustomerName('');
            setPropertyAddress('');
            setCounty(FLORIDA_COUNTIES[0]);
            onClose();
        } catch (error) {
            console.error("Failed to create package:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <CardTitle>Create New Permit Package</CardTitle>
            <CardDescription>Fill in the details below to start a new package.</CardDescription>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input id="propertyAddress" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} required />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="county">County</Label>
                    <Select id="county" value={county} onChange={e => setCounty(e.target.value)}>
                        {FLORIDA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Package'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

/**
 * UploadDocumentModal Component
 * A modal for uploading new documents to a package.
 */
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
            
            // Reset and close on success
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

/**
 * PermitPackageDetails Component
 * Displays details and documents for a selected permit package.
 */
const PermitPackageDetails = ({ package: permitPackage, onBack, onUpdate, onDocumentUpload }) => {
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);

    if (!permitPackage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <FileIcon className="w-16 h-16 mb-4" />
                <h3 className="text-lg font-semibold">No Package Selected</h3>
                <p>Select a permit package from the list to view its details.</p>
            </div>
        );
    }

    const handleStatusChange = async (newStatus) => {
        try {
            await onUpdate(permitPackage.id, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex items-center justify-between">
                <div>
                    <CardTitle>Package #{permitPackage.id}</CardTitle>
                    <CardDescription>{permitPackage.customerName} - {permitPackage.propertyAddress}</CardDescription>
                </div>
                <Button onClick={onBack} variant="outline">Back to List</Button>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
                <div className="space-y-2">
                    <h4 className="font-semibold">Package Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-gray-500">County:</p><p>{permitPackage.county}</p>
                        <p className="text-gray-500">Status:</p>
                        <div>
                            <Badge status={permitPackage.status}>{permitPackage.status}</Badge>
                        </div>
                        <p className="text-gray-500">Created:</p><p>{new Date(permitPackage.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Documents</h4>
                        <Button onClick={() => setUploadModalOpen(true)} size="sm" variant="outline">
                            <PlusCircleIcon className="w-4 h-4 mr-2" />
                            Upload Document
                        </Button>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableBody>
                                {permitPackage.documents && permitPackage.documents.length > 0 ? (
                                    permitPackage.documents.map(doc => (
                                        <TableRow key={doc.id}>
                                            <TableCell>
                                                <a href={`/uploads/${doc.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                                    <FileIcon className="w-4 h-4 mr-2" />
                                                    {doc.fileName}
                                                </a>
                                            </TableCell>
                                            <TableCell>{doc.version}</TableCell>
                                            <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{doc.uploaderName}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan="5" className="text-center py-4 text-gray-500">No documents uploaded yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleStatusChange('Draft')} disabled={permitPackage.status === 'Draft'}>Set to Draft</Button>
                <Button variant="outline" onClick={() => handleStatusChange('Submitted')} disabled={permitPackage.status === 'Submitted'}>Submit Package</Button>
                <Button onClick={() => handleStatusChange('Completed')} disabled={permitPackage.status === 'Completed'}>Complete Package</Button>
            </CardFooter>
            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setUploadModalOpen(false)}
                packageId={permitPackage.id}
                onDocumentUpload={onDocumentUpload}
            />
        </Card>
    );
};

/**
 * Dashboard Component
 * The main view for authenticated users, showing a list of permit packages
 * and details for a selected package.
 */
const Dashboard = ({ user, onLogout }) => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

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

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleCreatePackage = async (newPackageData) => {
    try {
        await api.post('/api/permits', newPackageData);
        fetchPackages(); // Refresh list
    } catch (error) {
        console.error("Failed to create package from dashboard:", error);
        // Optionally, show an error to the user
        throw error; // re-throw to let modal know it failed
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

  const handleDocumentUpload = async (packageId, formData) => {
    try {
        const updatedPackage = await api.postFormData(`/api/permits/${packageId}/documents`, formData);
        setPackages(prevPackages => prevPackages.map(p => p.id === packageId ? updatedPackage : p));
    } catch (error) {
        console.error("Failed to upload document from dashboard:", error);
        throw error; // re-throw to let modal know it failed
    }
  };

  const filteredPackages = useMemo(() => {
    if (!filter) return packages;
    return packages.filter(p =>
      p.customerName.toLowerCase().includes(filter.toLowerCase()) ||
      p.propertyAddress.toLowerCase().includes(filter.toLowerCase()) ||
      p.id.toString().includes(filter)
    );
  }, [packages, filter]);

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) return null;
    return packages.find(p => p.id === selectedPackageId);
  }, [packages, selectedPackageId]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">PermitPro Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name} ({user.role})</span>
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Permit Packages</CardTitle>
                  <CardDescription>A list of all permit packages in the system.</CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Filter..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-48"
                  />
                  <Button onClick={() => setCreateModalOpen(true)} className="whitespace-nowrap">
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center py-10 text-gray-500">Loading packages...</TableCell>
                      </TableRow>
                    ) : error ? (
                       <TableRow>
                        <TableCell colSpan="5" className="text-center py-10 text-red-500">{error}</TableCell>
                      </TableRow>
                    ) : filteredPackages.length > 0 ? (
                      filteredPackages.map((pkg) => (
                        <TableRow key={pkg.id} onClick={() => setSelectedPackageId(pkg.id)} className="cursor-pointer">
                          <TableCell className="font-medium">#{pkg.id}</TableCell>
                          <TableCell>{pkg.customerName}</TableCell>
                          <TableCell>{pkg.propertyAddress}</TableCell>
                          <TableCell><Badge status={pkg.status}>{pkg.status}</Badge></TableCell>
                          <TableCell>{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center py-10 text-gray-500">No packages found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Package Details</CardTitle>
                <CardDescription>View and manage selected package information</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPackage ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-medium">#{selectedPackage.id}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Customer</p>
                      <p>{selectedPackage.customerName}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{selectedPackage.propertyAddress}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">County</p>
                      <p>{selectedPackage.county}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Status</p>
                      <Badge status={selectedPackage.status}>{selectedPackage.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">Created</p>
                      <p>{new Date(selectedPackage.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <FileIcon className="w-16 h-16 mx-auto mb-4" />
                    <p>No package selected</p>
                    <p className="text-sm mt-2">Select a package from the list to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <CreatePackageModal 
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onPackageCreate={handleCreatePackage}
        />
      </main>
    </div>
  );
};

/**
 * App Component
 * The main application shell that manages state and renders different views.
 */
const App = () => {
  const [user, setUser] = useState(null); // Could check localStorage here for persistence
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPackages();
    }
  }, [user]);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/api/permits');
      // Normalize data for easier use
      const normalizedData = data.map(p => ({
          ...p,
          id: p.id.toString(),
          customerName: p.customer?.name || 'N/A',
          propertyAddress: p.customer?.propertyAddress || 'N/A',
      }));
      setPackages(normalizedData);
      // If a package was selected, update it with the fresh data
      if (selectedPackage) {
          const updatedSelected = normalizedData.find(p => p.id === selectedPackage.id);
          setSelectedPackage(updatedSelected);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData) => {
    // In a real app, you'd store the token from userData
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setPackages([]);
    setSelectedPackage(null);
    // Clear any stored tokens/user info
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleBackToList = () => {
    setSelectedPackage(null);
  };

  const handleCreatePackage = async (newPackageData) => {
    try {
        await api.post('/api/permits', newPackageData);
        await fetchPackages(); // Refetch to get the new package
    } catch (error) {
        console.error("Error creating package:", error);
        throw error; // Re-throw to be caught in the modal
    }
  };

  const handleUpdatePackage = async (packageId, updateData) => {
    try {
        const updatedPackage = await api.put(`/api/permits/${packageId}`, updateData);
        setPackages(prevPackages => prevPackages.map(p => p.id === packageId ? { ...p, ...updatedPackage } : p));
        if (selectedPackage && selectedPackage.id === packageId) {
            setSelectedPackage(prev => ({ ...prev, ...updatedPackage }));
        }
    } catch (error) {
        console.error("Error updating package:", error);
    }
  };

  const handleDocumentUpload = async (packageId, formData) => {
    try {
        await api.postFormData(`/api/permits/${packageId}/documents`, formData);
        await fetchPackages(); // Refetch to get updated documents list
    } catch (error) {
        console.error("Error uploading document:", error);
        throw error; // Re-throw to be caught in the modal
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-screen-2xl mx-auto p-8">
        <div className="lg:col-span-1">
          <Dashboard
            user={user}
            packages={packages}
            onSelectPackage={handleSelectPackage}
            onLogout={handleLogout}
            onPackageCreate={handleCreatePackage}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <PermitPackageDetails
            package={selectedPackage}
            onBack={handleBackToList}
            onUpdate={handleUpdatePackage}
            onDocumentUpload={handleDocumentUpload}
          />
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));