"use client";

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import {
  checkUsernameUniqueness,
  claimUsername,
  followUser,
  unfollowUser,
  acceptFollowRequest,
  rejectFollowRequest,
  removeFollower,
  getFollowers,
  getFollowing,
  getPendingFollowRequests,
  blockUser,
  unblockUser,
  getBlockedUsers,
  isBlocked,
  updatePrivacySettings,
  canViewProfileSection,
  searchUsers
} from '../lib/socialService';

export default function useSocial() {
  const user = useStore(state => state.user);
  const userId = user?.uid;

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // Sync state functions
  const refreshSocialState = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [followersList, followingList, pendingList, blockedList] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
        getPendingFollowRequests(userId),
        getBlockedUsers(userId)
      ]);
      setFollowers(followersList);
      setFollowing(followingList);
      setPendingRequests(pendingList);
      setBlockedUsers(blockedList);
    } catch (err) {
      console.error("Error refreshing social states", err);
      setError(err.message || "Failed to load social relationships.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load initial data
  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (!active) return;
      if (!userId) {
        setFollowers([]);
        setFollowing([]);
        setPendingRequests([]);
        setBlockedUsers([]);
        return;
      }
      try {
        const [followersList, followingList, pendingList, blockedList] = await Promise.all([
          getFollowers(userId),
          getFollowing(userId),
          getPendingFollowRequests(userId),
          getBlockedUsers(userId)
        ]);
        if (active) {
          setFollowers(followersList);
          setFollowing(followingList);
          setPendingRequests(pendingList);
          setBlockedUsers(blockedList);
        }
      } catch (err) {
        console.error("Initial load social states failed", err);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [userId]);

  // Username claims
  const claimUsernameAction = async (username) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await claimUsername(userId, username);
      return updatedProfile;
    } catch (err) {
      setError(err.message || "Failed to claim username.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAction = async (username) => {
    try {
      return await checkUsernameUniqueness(username);
    } catch (err) {
      setError(err.message || "Failed to check username uniqueness.");
      return false;
    }
  };

  // Follow management
  const followUserAction = async (targetId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const follow = await followUser(userId, targetId);
      await refreshSocialState();
      return follow;
    } catch (err) {
      setError(err.message || "Failed to follow user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unfollowUserAction = async (targetId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await unfollowUser(userId, targetId);
      await refreshSocialState();
    } catch (err) {
      setError(err.message || "Failed to unfollow user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptFollowAction = async (followerId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await acceptFollowRequest(userId, followerId);
      await refreshSocialState();
    } catch (err) {
      setError(err.message || "Failed to accept follow request.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectFollowAction = async (followerId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await rejectFollowRequest(userId, followerId);
      await refreshSocialState();
    } catch (err) {
      setError(err.message || "Failed to reject follow request.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFollowerAction = async (followerId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await removeFollower(userId, followerId);
      await refreshSocialState();
    } catch (err) {
      setError(err.message || "Failed to remove follower.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Block management
  const blockUserAction = async (targetId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await blockUser(userId, targetId);
      await refreshSocialState();
    } catch (err) {
      setError(err.message || "Failed to block user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unblockUserAction = async (targetId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await unblockUser(userId, targetId);
      await refreshSocialState();
    } catch (err) {
      setError(err.message || "Failed to unblock user.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // User search
  const searchUsersAction = useCallback(async (queryText) => {
    if (!queryText || queryText.trim() === '') {
      setSearchResults([]);
      return [];
    }
    setLoading(true);
    setError(null);
    try {
      const results = await searchUsers(queryText, userId);
      setSearchResults(results);
      return results;
    } catch (err) {
      setError(err.message || "Failed to search users.");
      setSearchResults([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Privacy updates
  const updatePrivacyAction = async (privacySettings) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await updatePrivacySettings(userId, privacySettings);
      return updatedProfile;
    } catch (err) {
      setError(err.message || "Failed to update privacy settings.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkViewPermission = async (ownerId, section) => {
    try {
      return await canViewProfileSection(userId, ownerId, section);
    } catch (err) {
      console.error("Error checking section permission", err);
      return false;
    }
  };

  return {
    followers,
    following,
    pendingRequests,
    blockedUsers,
    searchResults,
    loading,
    error,
    clearError,
    refreshSocial: refreshSocialState,
    claimUsername: claimUsernameAction,
    checkUsername: checkUsernameAction,
    followUser: followUserAction,
    unfollowUser: unfollowUserAction,
    acceptFollow: acceptFollowAction,
    rejectFollow: rejectFollowAction,
    removeFollower: removeFollowerAction,
    blockUser: blockUserAction,
    unblockUser: unblockUserAction,
    searchUsers: searchUsersAction,
    updatePrivacy: updatePrivacyAction,
    checkViewPermission
  };
}
