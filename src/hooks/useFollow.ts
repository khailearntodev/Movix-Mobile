import { useState, useEffect } from 'react';
import { followService } from '@/services/follow.service';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, DeviceEventEmitter } from 'react-native';

export const useFollow = (targetUserId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleFollowChange = (event: any) => {
      if (event.userId === targetUserId) {
        setIsFollowing(event.isFollowing);
      }
    };
    
    const subscription = DeviceEventEmitter.addListener('follow_status_change', handleFollowChange);
    return () => {
      subscription.remove();
    };
  }, [targetUserId]);

  useEffect(() => {
    if (!user || !targetUserId || user.id === targetUserId) {
      setIsFollowing(false);
      setIsLoading(false);
      return;
    }
    
    const checkFollowStatus = async () => {
      setIsLoading(true);
      try {
        const following = await followService.isFollowing(targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Failed to fetch followings', error);
        setIsFollowing(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [user, targetUserId]);

  const toggleFollow = async () => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để theo dõi');
      return;
    }

    if (user.id === targetUserId) {
      return;
    }

    // Capture the current status before changing
    const currentStatus = isFollowing;
    const newStatus = !currentStatus;

    // Optimistic update
    setIsFollowing(newStatus);
    DeviceEventEmitter.emit('follow_status_change', {
      userId: targetUserId, 
      isFollowing: newStatus 
    });
    
    try {
      if (currentStatus) {
        await followService.unFollow(targetUserId);
      } else {
        await followService.follow(targetUserId);
      }
    } catch (error: any) {
      // Revert on error
      setIsFollowing(currentStatus);
      DeviceEventEmitter.emit('follow_status_change', {
        userId: targetUserId, 
        isFollowing: currentStatus 
      });
      Alert.alert('Lỗi', error.response?.data?.error || 'Đã xảy ra lỗi, vui lòng thử lại');
    }
  };

  return { isFollowing, isLoading, toggleFollow };
};
