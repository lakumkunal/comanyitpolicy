import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './GetPolicy.css';
import ReactPaginate from 'react-paginate';
import {toast} from 'react-toastify';
import EditIcon from '../images/edit.png';  
import SuspendIcon from '../images/suspend.png';  
import log from '../log';
const GetPolicy = () => {
    const [policies, setPolicies] = useState([]);
    const [filter, setFilter] = useState({
        column: '',
        search: '',
        status: '',
        column2: '',
        search2: '',
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedPolicyId, setSelectedPolicyId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const policiesPerPage = 10;
    const navigate = useNavigate();
    const [selectedPolicyName, setSelectedPolicyName] = useState('');

    
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getcompanyitpolicy');
    
                if (response.ok) {
                    const data = await response.json();
                    setPolicies(data);
    
                    
                    log('GET /api/getcompanyitpolicy', 'Success', 200, 'Policies retrieved successfully');
                } else {
                    console.error('Failed to fetch policies');
    
                   
                    log('GET /api/getcompanyitpolicy', 'Error', response.status, 'Failed to fetch policies');
                }
            } catch (error) {
                console.error('Error fetching policies:', error);
    
               
                log('GET /api/getcompanyitpolicy', 'Error', 500, 'An error occurred while fetching policies');
            }
        };
    
        
        fetchPolicies();
    }, []);
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;
        if (name === 'search' && filter.column === 'passwordneverexpires') {
            newValue = value.toLowerCase() === 'Yes' ? 1 : value.toLowerCase() === 'No' ? 0 : ''; // Convert Yes/No to 1/0
        } else if (name === 'search2' && filter.column2 === 'passwordneverexpires') {
            newValue = value.toLowerCase() === 'Yes' ? 1 : value.toLowerCase() === 'No' ? 0 : ''; // Convert Yes/No to 1/0 for second column
        }

        setFilter(prevFilter => ({
            ...prevFilter,
            [name]: value
        }));
    };

    const filteredPolicies = policies.filter(policy => {
        
        const matchYesNo = (searchTerm, value) => {
            const normalizedTerm = searchTerm.toLowerCase();
            return normalizedTerm === 'yes' || normalizedTerm === 'y' || normalizedTerm === 'e' || normalizedTerm === 'ye'
                ? value === 1
                : normalizedTerm === 'no' || normalizedTerm === 'n' || normalizedTerm === 'o' || normalizedTerm === 'no'
                ? value === 0
                : false;
        };
    
       
        const columnMatch = filter.column && filter.search
            ? filter.column === 'passwordneverexpires'
                ? matchYesNo(filter.search, policy[filter.column])
                : policy[filter.column]?.toString().toLowerCase().includes(filter.search.toLowerCase())
            : true;
    
       
        const column2Match = filter.column2 && filter.search2
            ? filter.column2 === 'passwordneverexpires'
                ? matchYesNo(filter.search2, policy[filter.column2])
                : policy[filter.column2]?.toString().toLowerCase().includes(filter.search2.toLowerCase())
            : true;
    
        
        const statusMatch = filter.status
            ? policy.status.toString() === filter.status
            : true;
    
       
        return columnMatch && column2Match && statusMatch;
    });
    

    
    const pageCount = Math.ceil(filteredPolicies.length / policiesPerPage);

    
    const handlePageClick = (event) => {
        const newOffset = (event.selected * policiesPerPage) % filteredPolicies.length;
        setCurrentPage(event.selected);
    };

    const currentPolicies = filteredPolicies.slice(currentPage * policiesPerPage, (currentPage + 1) * policiesPerPage);

    const handleEdit = (policyId) => {
        navigate(`/EditPolicy/${policyId}`);
    };

    const handleSuspend = (policyId,policyName) => {
        setSelectedPolicyId(policyId);
        setSelectedPolicyName(policyName); 
        setShowModal(true);
    };

    const confirmSuspend = async () => {
        const policyName = selectedPolicyName; 
    
        try {
            const response = await fetch(`http://localhost:5000/api/suspendPolicy/${selectedPolicyId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
               
                toast.success(`${policyName} suspended successfully!`);
                log('POST /api/suspendPolicy', 'Success', 200, `Policy ${policyName} suspended successfully`);
    
                const updatedPolicies = policies.map(policy =>
                    policy.id === selectedPolicyId ? { ...policy, status: 3 } : policy
                );
                setPolicies(updatedPolicies);
            } else {
               
                console.error('Failed to suspend policy');
                toast.error(`Error suspending ${policyName}. Please try again.`);
                log('POST /api/suspendPolicy', 'Error', response.status, `Failed to suspend policy ${policyName}`);
            }
        } catch (error) {
            
            console.error('Error during suspension:', error);
            toast.error(`An error occurred while suspending ${policyName}. Please check the console for details.`);
            log('POST /api/suspendPolicy', 'Error', 500, `Error during suspension of policy ${policyName}`);
        } finally {
            setShowModal(false); 
        }
    };
    
    
    const cancelSuspend = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Company IT Policy - Display Screen</h1>
            <div className="filter-row mb-4">
                <div className="form-row mb-3 filters-row">
                    <div className="col">
                        <select name="column" value={filter.column} onChange={handleFilterChange} className="filter-select">
                            <option value="">Select Column 1</option>
                            <option value="policyname">Policy Name</option>
                            <option value="sessiontimeout">Session Time Out</option>
                            <option value="passwordattempts">Password Attempts</option>
                            <option value="passwordneverexpires">Password Never Expires</option>
                            <option value="passwordchangeduration">Password Change Duration</option>
                        </select>
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            name="search"
                            value={filter.search}
                            onChange={handleFilterChange}
                            placeholder="Search in Column 1"
                            className="filter-input"
                        />
                    </div>
                    <div className="col">
                        <select name="column2" value={filter.column2} onChange={handleFilterChange} className="filter-select">
                            <option value="">Select Column 2</option>
                            <option value="policyname" disabled={filter.column === 'policyname'}>Policy Name</option>
                            <option value="sessiontimeout" disabled={filter.column === 'sessiontimeout'}>Session Time Out</option>
                            <option value="passwordattempts" disabled={filter.column === 'passwordattempts'}>Password Attempts</option>
                            <option value="passwordneverexpires" disabled={filter.column === 'passwordneverexpires'}>Password Never Expires</option>
                            <option value="passwordchangeduration" disabled={filter.column === 'passwordchangeduration'}>Password Change Duration</option>
                        </select>
                    </div>
                    <div className="col">
                        <input
                            type="text"
                            name="search2"
                            value={filter.search2}
                            onChange={handleFilterChange}
                            placeholder="Search in Column 2"
                            className="filter-input"
                        />
                    </div>
                    <div className="col">
                        <select name="status" value={filter.status} onChange={handleFilterChange} className="filter-select">
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="2">Inactive</option>
                            <option value="3">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">Serial No.</th>
                        <th scope="col">Policy Name</th>
                        <th scope="col">Session Time Out (minutes)</th>
                        <th scope="col">Password Attempts</th>
                        <th scope="col">Password Never Expires</th>
                        <th scope="col">Password Change Duration</th>
                        <th scope="col">Password Expire Notification</th>
                        <th scope="col">Status</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPolicies.length > 0 ? (
                        currentPolicies.map((policy, index) => (
                            <tr key={policy.id}>
                                <td>{currentPage * policiesPerPage + index + 1}</td>
                                <td>{policy.policyname}</td>
                                <td>{policy.sessiontimeout}</td>
                                <td>{policy.passwordattempts}</td>
                                <td>{policy.passwordneverexpires ? 'Yes' : 'No'}</td>
                                <td>{policy.passwordneverexpires ? 'N/A' : policy.passwordchangeduration}</td>
                                <td>{policy.passwordneverexpires ? 'N/A' : policy.passwordexpirenotification}</td>
                                <td>
                                    {policy.status === 1
                                        ? 'Active'
                                        : policy.status === 3
                                        ? 'Suspended'
                                        : 'Inactive'}
                                </td>
                                <td>
                                    {policy.status === 3 ? (
                                        <span>-</span> 
                                    ) : (
                                        <div className="d-flex">
                                            <button 
                                                className="btn btn-primary mr-2 p-0" 
                                                onClick={() => handleEdit(policy.id)} 
                                                style={{ border: 'none', background: 'none', marginRight: '20px' }}
                                            >
                                                <img src={EditIcon} alt="Edit" style={{ width: '24px', height: '24px' }} />
                                            </button>

                                            <button 
                                                    className="btn btn-warning p-0" 
                                                    onClick={() => handleSuspend(policy.id, policy.policyname)} 
                                                    style={{ border: 'none', background: 'none' }}
                                                >
                                                    <img src={SuspendIcon} alt="Suspend" style={{ width: '24px', height: '24px' }} />
                                                </button>
                                        </div>
                                    )}
                                    </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center">No policies found</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <ReactPaginate
                previousLabel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                pageClassName={'page-item'}
                pageLinkClassName={'page-link'}
                previousClassName={'page-item'}
                previousLinkClassName={'page-link'}
                nextClassName={'page-item'}
                nextLinkClassName={'page-link'}
                breakClassName={'page-item'}
                breakLinkClassName={'page-link'}
                activeClassName={'active'}
                disabledClassName={'disabled'}
            />
            <button className="btn btn-secondary mt-3" onClick={() => navigate('/AddPolicy')}>Back</button>

            <div className={`modal fade ${showModal ? 'show' : ''}`} tabIndex="-1" role="dialog" style={{ display: showModal ? 'block' : 'none' }} aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Confirm Suspension</h5>
                            {/* Remove the close button */}
                        </div>
                        <div className="modal-body">
                            Are you sure you want to suspend this policy?
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={cancelSuspend}>No</button>
                            <button type="button" className="btn btn-primary" onClick={confirmSuspend}>Yes</button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default GetPolicy;
