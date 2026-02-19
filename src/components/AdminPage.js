import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  getAdminUsers,
  getAdminReviews,
  adminDeleteReview,
  adminDeleteUser,
  adminPromoteUser,
  adminBanUser,
  adminUnbanUser,
  adminCreateUser,
} from '../services/api';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AdminBadge = styled.span`
  background: linear-gradient(135deg, #FACC15, #F59E0B);
  color: #000;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: var(--card-bg);
  padding: 6px;
  border-radius: 12px;
  border: 2px solid var(--card-border);
  width: fit-content;
`;

const Tab = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$active
    ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'
    : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text-secondary)'};

  &:hover {
    color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 4px;
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--divider);
`;

const CardTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
`;

const SearchInput = styled.input`
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 14px;
  color: var(--text-primary);
  font-size: 0.9rem;
  width: 250px;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const Table = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns};
  padding: 14px 24px;
  background: var(--section-bg);
  border-bottom: 1px solid var(--divider);
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$columns};
  padding: 16px 24px;
  border-bottom: 1px solid var(--divider);
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: var(--section-bg);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$image
    ? `url(${props.$image}) center/cover`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  text-transform: uppercase;
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 700;
  color: var(--text-primary);
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: var(--text-secondary);
`;

const RoleBadge = styled.span`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;

  ${props => props.$role === 'admin' && `
    background: linear-gradient(135deg, #FACC15, #F59E0B);
    color: #000;
  `}

  ${props => props.$role === 'user' && `
    background: var(--tag-bg);
    color: var(--text-secondary);
    border: 1px solid var(--tag-border);
  `}

  ${props => props.$role === 'banned' && `
    background: rgba(239, 68, 68, 0.2);
    color: #FCA5A5;
    border: 1px solid rgba(239, 68, 68, 0.4);
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.$variant === 'primary' && `
    background: var(--neon-purple);
    color: white;
    &:hover { background: #9333EA; }
  `}

  ${props => props.$variant === 'danger' && `
    background: rgba(239, 68, 68, 0.2);
    color: #FCA5A5;
    border: 1px solid rgba(239, 68, 68, 0.4);
    &:hover { background: #EF4444; color: white; }
  `}

  ${props => props.$variant === 'warning' && `
    background: rgba(251, 191, 36, 0.2);
    color: #FCD34D;
    border: 1px solid rgba(251, 191, 36, 0.4);
    &:hover { background: #F59E0B; color: #000; }
  `}

  ${props => props.$variant === 'success' && `
    background: rgba(34, 197, 94, 0.2);
    color: #4ADE80;
    border: 1px solid rgba(34, 197, 94, 0.4);
    &:hover { background: #22C55E; color: white; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ReviewContent = styled.div`
  max-width: 300px;
`;

const ReviewGame = styled.div`
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

const ReviewText = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Rating = styled.span`
  color: var(--neon-cyan);
  font-weight: 700;
`;

const Message = styled.div`
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 24px;
  font-weight: 600;
  font-size: 0.9rem;

  ${props => props.$type === 'success' && `
    background: rgba(34, 197, 94, 0.15);
    border: 2px solid rgba(34, 197, 94, 0.3);
    color: #4ADE80;
  `}

  ${props => props.$type === 'error' && `
    background: rgba(239, 68, 68, 0.15);
    border: 2px solid rgba(239, 68, 68, 0.3);
    color: #FCA5A5;
  `}
`;

const EmptyState = styled.div`
  padding: 60px 24px;
  text-align: center;
  color: var(--text-secondary);
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }
`;

const Select = styled.select`
  width: 100%;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 12px 14px;
  color: var(--text-primary);
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 28px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$primary && `
    background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
    border: none;
    color: white;
    &:hover { transform: translateY(-2px); }
  `}

  ${props => !props.$primary && `
    background: transparent;
    border: 2px solid var(--card-border);
    color: var(--text-secondary);
    &:hover { border-color: var(--text-primary); color: var(--text-primary); }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CreateButton = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }
`;

const USER_COLUMNS = '2fr 1fr 1fr 1fr 2fr';
const REVIEW_COLUMNS = '2fr 2fr 0.8fr 1fr 1.5fr';

function AdminPage({ user }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', role: 'user' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, reviewsData] = await Promise.all([
        getAdminUsers(user.username),
        getAdminReviews(user.username),
      ]);
      setUsers(usersData);
      setReviews(reviewsData);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await adminDeleteReview(reviewId, user.username);
      setReviews(reviews.filter(r => r._id !== reviewId));
      setMessage({ type: 'success', text: 'Review deleted successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete review' });
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}" and all their reviews?`)) return;

    try {
      await adminDeleteUser(username, user.username);
      setUsers(users.filter(u => u.username !== username));
      setReviews(reviews.filter(r => r.username !== username));
      setMessage({ type: 'success', text: `User "${username}" deleted successfully` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete user' });
    }
  };

  const handlePromoteUser = async (username) => {
    if (!window.confirm(`Promote "${username}" to admin?`)) return;

    try {
      await adminPromoteUser(username, user.username);
      setUsers(users.map(u => u.username === username ? { ...u, role: 'admin' } : u));
      setMessage({ type: 'success', text: `User "${username}" promoted to admin` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to promote user' });
    }
  };

  const handleBanUser = async (username) => {
    if (!window.confirm(`Ban user "${username}"?`)) return;

    try {
      await adminBanUser(username, user.username);
      setUsers(users.map(u => u.username === username ? { ...u, isBanned: true } : u));
      setMessage({ type: 'success', text: `User "${username}" has been banned` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to ban user' });
    }
  };

  const handleUnbanUser = async (username) => {
    try {
      await adminUnbanUser(username, user.username);
      setUsers(users.map(u => u.username === username ? { ...u, isBanned: false } : u));
      setMessage({ type: 'success', text: `User "${username}" has been unbanned` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to unban user' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      setMessage({ type: 'error', text: 'Username and password are required' });
      return;
    }

    setCreating(true);
    try {
      const created = await adminCreateUser(newUser, user.username);
      setUsers([...users, created]);
      setShowCreateModal(false);
      setNewUser({ username: '', password: '', email: '', role: 'user' });
      setMessage({ type: 'success', text: `User "${created.username}" created successfully` });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create user' });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(r =>
    r.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reviewText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalUsers: users.length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    totalReviews: reviews.length,
    bannedUsers: users.filter(u => u.isBanned).length,
  };

  if (user.role !== 'admin') {
    return (
      <PageContainer>
        <Message $type="error">Access denied. Admin privileges required.</Message>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>
          Admin Dashboard
          <AdminBadge>ADMIN</AdminBadge>
        </Title>
        <Subtitle>Manage users and moderate content</Subtitle>
      </PageHeader>

      {message && (
        <Message $type={message.type}>{message.text}</Message>
      )}

      <StatsRow>
        <StatCard>
          <StatNumber>{stats.totalUsers}</StatNumber>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalAdmins}</StatNumber>
          <StatLabel>Admins</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalReviews}</StatNumber>
          <StatLabel>Total Reviews</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.bannedUsers}</StatNumber>
          <StatLabel>Banned Users</StatLabel>
        </StatCard>
      </StatsRow>

      <TabsContainer>
        <Tab $active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSearchTerm(''); }}>
          Users
        </Tab>
        <Tab $active={activeTab === 'reviews'} onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}>
          Reviews
        </Tab>
      </TabsContainer>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'users' ? `Users (${filteredUsers.length})` : `Reviews (${filteredReviews.length})`}
          </CardTitle>
          <div style={{ display: 'flex', gap: '12px' }}>
            <SearchInput
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {activeTab === 'users' && (
              <CreateButton onClick={() => setShowCreateModal(true)}>
                + Create User
              </CreateButton>
            )}
          </div>
        </CardHeader>

        {loading ? (
          <EmptyState>Loading...</EmptyState>
        ) : activeTab === 'users' ? (
          <Table>
            <TableHeader $columns={USER_COLUMNS}>
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
              <span>Actions</span>
            </TableHeader>
            {filteredUsers.length === 0 ? (
              <EmptyState>No users found</EmptyState>
            ) : (
              filteredUsers.map(u => (
                <TableRow key={u._id} $columns={USER_COLUMNS}>
                  <UserInfo>
                    <Avatar $image={u.profilePicture}>
                      {!u.profilePicture && u.username.charAt(0)}
                    </Avatar>
                    <UserDetails>
                      <UserName>{u.username}</UserName>
                      <UserEmail>{u.email || 'No email'}</UserEmail>
                    </UserDetails>
                  </UserInfo>
                  <div>
                    <RoleBadge $role={u.role}>{u.role}</RoleBadge>
                  </div>
                  <div>
                    {u.isBanned ? (
                      <RoleBadge $role="banned">Banned</RoleBadge>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Active</span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                  <ActionButtons>
                    {u.username !== user.username && (
                      <>
                        {u.role !== 'admin' && (
                          <ActionButton $variant="primary" onClick={() => handlePromoteUser(u.username)}>
                            Promote
                          </ActionButton>
                        )}
                        {u.isBanned ? (
                          <ActionButton $variant="success" onClick={() => handleUnbanUser(u.username)}>
                            Unban
                          </ActionButton>
                        ) : (
                          <ActionButton $variant="warning" onClick={() => handleBanUser(u.username)}>
                            Ban
                          </ActionButton>
                        )}
                        <ActionButton $variant="danger" onClick={() => handleDeleteUser(u.username)}>
                          Delete
                        </ActionButton>
                      </>
                    )}
                    {u.username === user.username && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>You</span>
                    )}
                  </ActionButtons>
                </TableRow>
              ))
            )}
          </Table>
        ) : (
          <Table>
            <TableHeader $columns={REVIEW_COLUMNS}>
              <span>User</span>
              <span>Review</span>
              <span>Rating</span>
              <span>Date</span>
              <span>Actions</span>
            </TableHeader>
            {filteredReviews.length === 0 ? (
              <EmptyState>No reviews found</EmptyState>
            ) : (
              filteredReviews.map(r => (
                <TableRow key={r._id} $columns={REVIEW_COLUMNS}>
                  <UserInfo>
                    <Avatar>{r.username.charAt(0)}</Avatar>
                    <UserName>{r.username}</UserName>
                  </UserInfo>
                  <ReviewContent>
                    <ReviewGame>{r.gameTitle}</ReviewGame>
                    <ReviewText>{r.reviewText}</ReviewText>
                  </ReviewContent>
                  <Rating>{r.rating}/5</Rating>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(r.timestamp).toLocaleDateString()}
                  </div>
                  <ActionButtons>
                    <ActionButton $variant="danger" onClick={() => handleDeleteReview(r._id)}>
                      Delete
                    </ActionButton>
                  </ActionButtons>
                </TableRow>
              ))
            )}
          </Table>
        )}
      </Card>

      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Create New User</ModalTitle>
            <form onSubmit={handleCreateUser}>
              <FormGroup>
                <Label>Username *</Label>
                <Input
                  type="text"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Enter username"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Password *</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email (optional)"
                />
              </FormGroup>
              <FormGroup>
                <Label>Role</Label>
                <Select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormGroup>
              <ModalButtons>
                <ModalButton type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </ModalButton>
                <ModalButton type="submit" $primary disabled={creating}>
                  {creating ? 'Creating...' : 'Create User'}
                </ModalButton>
              </ModalButtons>
            </form>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}

export default AdminPage;
