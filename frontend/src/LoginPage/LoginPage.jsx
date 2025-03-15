import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userAPI from '../api/userAPI';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await userAPI.login(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username);
      localStorage.setItem('role', response.role);
      
      // 根据用户角色跳转到不同页面
      switch(response.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'owner':
          navigate('/owner');
          break;
        case 'user':
          navigate('/');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the code ...
}
