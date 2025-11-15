import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (auth.user) {
      setFormData({
        name: auth.user.name,
        email: auth.user.email,
      });
    }
  }, [auth.user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Profile updated successfully!'); // Placeholder for API call
    // In a real application, you would make an API call here to update the user's profile.
    // For example:
    // try {
    //   const response = await axios.put('/api/user/profile', formData, {
    //     headers: { Authorization: `Bearer ${auth.token}` }
    //   });
    //   updateUser(response.data.user); // Assuming you have an updateUser function in your context
    //   setMessage('Profile updated successfully!');
    //   setIsEditing(false);
    // } catch (error) {
    //   setMessage('Failed to update profile.');
    // }
    setTimeout(() => setMessage(''), 3000);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!auth.user) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light text-center">
              <h2 className="mb-0">My Profile</h2>
            </div>
            <div className="card-body p-4">
              {message && <div className="alert alert-success">{message}</div>}
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <p className="form-control-plaintext text-capitalize">{auth?.user?.role?.toLowerCase()}</p>
                </div>
                
                {isEditing ? (
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    <button type="button" className="btn btn-outline-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                  </div>
                )}
              </form>
              <hr />
              <div className="d-grid">
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;