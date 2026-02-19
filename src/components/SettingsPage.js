import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { uploadImage, updateUserProfile } from '../services/api';

const PageContainer = styled.div`
  max-width: 800px;
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
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const SettingsCard = styled.div`
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProfilePhotoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
`;

const AvatarPreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$hasImage
    ? `url(${props.$image}) center/cover no-repeat`
    : 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  border: 3px solid var(--card-border);
  flex-shrink: 0;
`;

const PhotoButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UploadButton = styled.button`
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  border: 2px solid var(--card-border);
  border-radius: 8px;
  padding: 8px 16px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #EF4444;
    color: #EF4444;
  }
`;

const PhotoHint = styled.p`
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin-top: 8px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
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
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
  }

  &::placeholder {
    color: var(--text-secondary);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  background: var(--deep-space);
  border: 2px solid var(--card-border);
  border-radius: 10px;
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--neon-purple);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
  }

  &::placeholder {
    color: var(--text-secondary);
  }
`;

const CharCount = styled.span`
  display: block;
  text-align: right;
  font-size: 0.8rem;
  color: ${props => props.$over ? '#EF4444' : 'var(--text-secondary)'};
  margin-top: 6px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, var(--neon-purple), var(--neon-cyan));
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
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

const BIO_MAX_LENGTH = 200;

function SettingsPage({ user, onUserUpdate }) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    profilePhoto: user?.profilePicture || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'bio' && value.length > BIO_MAX_LENGTH) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({ ...prev, profilePhoto: imageUrl }));
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload photo. Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updatedUser = await updateUserProfile(user.username, {
        email: formData.email,
        fullName: formData.fullName,
        bio: formData.bio,
        profilePhoto: formData.profilePhoto,
      });

      // Update the user in parent component and localStorage
      const newUserData = { ...user, ...updatedUser };
      onUserUpdate(newUserData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Settings</Title>
        <Subtitle>Manage your profile and preferences</Subtitle>
      </PageHeader>

      {message && (
        <Message $type={message.type}>{message.text}</Message>
      )}

      <form onSubmit={handleSubmit}>
        <SettingsCard>
          <SectionTitle>Profile Photo</SectionTitle>
          <ProfilePhotoSection>
            <AvatarPreview
              $hasImage={!!formData.profilePhoto}
              $image={formData.profilePhoto}
            >
              {!formData.profilePhoto && (user?.username?.charAt(0) || 'U')}
            </AvatarPreview>
            <div>
              <PhotoButtons>
                <UploadButton
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </UploadButton>
                {formData.profilePhoto && (
                  <RemoveButton type="button" onClick={handleRemovePhoto}>
                    Remove Photo
                  </RemoveButton>
                )}
              </PhotoButtons>
              <PhotoHint>JPG, PNG or GIF. Max size 5MB.</PhotoHint>
              <HiddenInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
            </div>
          </ProfilePhotoSection>
        </SettingsCard>

        <SettingsCard>
          <SectionTitle>Profile Information</SectionTitle>

          <FormRow>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                disabled
                title="Username cannot be changed"
              />
            </FormGroup>
            <FormGroup>
              <Label>Full Name</Label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
            />
          </FormGroup>

          <FormGroup>
            <Label>Bio</Label>
            <TextArea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell the community about yourself and your gaming interests..."
            />
            <CharCount $over={formData.bio.length >= BIO_MAX_LENGTH}>
              {formData.bio.length}/{BIO_MAX_LENGTH}
            </CharCount>
          </FormGroup>
        </SettingsCard>

        <SaveButton type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </SaveButton>
      </form>
    </PageContainer>
  );
}

export default SettingsPage;
