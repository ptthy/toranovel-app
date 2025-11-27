import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Keyboard
} from 'react-native';
// Import thêm ThumbsUp, ThumbsDown, MessageCircle, CornerDownRight
import { X, Send, User as UserIcon, Flag, ThumbsUp, ThumbsDown, MessageCircle, CornerDownRight } from 'lucide-react-native';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { ReportModal } from './ReportModal';

// --- TYPES CẬP NHẬT ---
interface Comment {
  commentId: string;
  content: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
  
  // Thêm các trường tương tác
  likeCount: number;
  dislikeCount: number;
  viewerReaction?: 'like' | 'dislike' | null; // Trạng thái của user hiện tại
  replyCount?: number; // Số lượng phản hồi (nếu có)
}

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  chapterId: string;
}

export function CommentModal({ visible, onClose, chapterId }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  // --- STATE REPLY ---
  // Lưu thông tin comment đang được trả lời
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  // --- STATE REPORT ---
  const [reportVisible, setReportVisible] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (visible && chapterId) {
      fetchComments();
    }
  }, [visible, chapterId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/ChapterComment/chapter/${chapterId}?page=1&pageSize=50`);
      const data = response.data.items || response.data; 
      setComments(data);
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- XỬ LÝ LIKE / DISLIKE ---
  const handleReaction = async (comment: Comment, type: 'like' | 'dislike') => {
    // 1. Optimistic Update (Cập nhật giao diện ngay lập tức cho mượt)
    const originalComments = [...comments]; // Backup để revert nếu lỗi
    
    setComments(prevComments => prevComments.map(c => {
      if (c.commentId === comment.commentId) {
        let newLikeCount = c.likeCount;
        let newDislikeCount = c.dislikeCount;
 let newReaction: 'like' | 'dislike' | null = type;

        // Nếu đang click vào cái đã chọn -> Bỏ chọn (Unlike/Undislike)
        if (c.viewerReaction === type) {
          newReaction = null; // Reset
          if (type === 'like') newLikeCount--;
          else newDislikeCount--;
        } 
        // Nếu đổi từ Like sang Dislike hoặc ngược lại
        else {
          if (c.viewerReaction === 'like') newLikeCount--; // Bỏ like cũ
          if (c.viewerReaction === 'dislike') newDislikeCount--; // Bỏ dislike cũ
          
          if (type === 'like') newLikeCount++;
          else newDislikeCount++;
        }

        return { 
          ...c, 
          likeCount: Math.max(0, newLikeCount), 
          dislikeCount: Math.max(0, newDislikeCount), 
          viewerReaction: newReaction 
        } as any;
      }
      return c;
    }));

    // 2. Gọi API ngầm
    try {
      // Nếu user bỏ reaction (click lại cái cũ)
      if (comment.viewerReaction === type) {
        await apiClient.delete(`/api/ChapterComment/${chapterId}/${comment.commentId}/reaction`);
      } else {
        // Nếu user tạo mới hoặc đổi reaction
        await apiClient.post(`/api/ChapterComment/${chapterId}/${comment.commentId}/reaction`, {
          reactionType: type
        });
      }
    } catch (error) {
      console.error("Lỗi reaction:", error);
      // Revert lại UI nếu lỗi
      setComments(originalComments); 
    }
  };

  // --- XỬ LÝ CHUẨN BỊ TRẢ LỜI ---
  const handleInitiateReply = (comment: Comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus(); // Tự động bật bàn phím
  };

  // --- HỦY TRẢ LỜI ---
  const handleCancelReply = () => {
    setReplyingTo(null);
    Keyboard.dismiss();
  };

  // --- GỬI BÌNH LUẬN (HOẶC TRẢ LỜI) ---
  const handlePostComment = async () => {
    if (!inputText.trim()) return;
    setSending(true);
    try {
      // Payload gửi lên
      const payload: any = { content: inputText };
      
      // Nếu đang trả lời thì gắn thêm parentCommentId
      if (replyingTo) {
        payload.parentCommentId = replyingTo.commentId;
      }

      await apiClient.post(`/api/ChapterComment/${chapterId}`, payload);
      
      setInputText('');
      setReplyingTo(null); // Reset trạng thái reply
      fetchComments();     // Load lại danh sách
    } catch (error) {
      console.error("Lỗi đăng bình luận:", error);
      Alert.alert("Lỗi", "Không thể đăng bình luận. Vui lòng thử lại.");
    } finally {
      setSending(false);
    }
  };

  const handleReportPress = (commentId: string) => {
    setSelectedCommentId(commentId);
    setReportVisible(true);
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
             <UserIcon size={20} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.commentContentWrapper}>
        {/* Nội dung comment */}
        <View style={styles.commentBubble}>
          <View style={styles.commentHeader}>
              <Text style={styles.username}>{item.username || 'Người dùng'}</Text>
              <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
          </View>
          <Text style={styles.textContent}>{item.content}</Text>
        </View>

        {/* --- THANH ACTION (LIKE, DISLIKE, REPLY, REPORT) --- */}
        <View style={styles.actionBar}>
          {/* Nút Like */}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleReaction(item, 'like')}>
             <ThumbsUp 
                size={14} 
                color={item.viewerReaction === 'like' ? '#2C6B7C' : '#666'} 
                fill={item.viewerReaction === 'like' ? '#2C6B7C' : 'transparent'}
             />
             {item.likeCount > 0 && (
                <Text style={[styles.actionText, item.viewerReaction === 'like' && styles.actionTextActive]}>
                  {item.likeCount}
                </Text>
             )}
          </TouchableOpacity>

          {/* Nút Dislike */}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleReaction(item, 'dislike')}>
             <ThumbsDown 
                size={14} 
                color={item.viewerReaction === 'dislike' ? '#DC3545' : '#666'}
                fill={item.viewerReaction === 'dislike' ? '#DC3545' : 'transparent'} 
             />
          </TouchableOpacity>

          {/* Nút Reply */}
          <TouchableOpacity style={styles.actionButton} onPress={() => handleInitiateReply(item)}>
             <Text style={styles.actionTextReply}>Trả lời</Text>
          </TouchableOpacity>

          {/* Nút Report (Chuyển xuống đây cho gọn) */}
          <TouchableOpacity style={[styles.actionButton, { marginLeft: 'auto' }]} onPress={() => handleReportPress(item.commentId)}>
             <Flag size={12} color="#999" />
          </TouchableOpacity>
        </View>
        {/* -------------------------------------------------- */}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Bình luận ({comments.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
            <View style={styles.center}><ActivityIndicator size="small" color="#2C6B7C" /></View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.commentId || Math.random().toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>}
            />
          )}

          {/* --- KHU VỰC NHẬP LIỆU --- */}
          <View style={styles.footerContainer}>
            
            {/* Thanh hiển thị "Đang trả lời..." */}
            {replyingTo && (
              <View style={styles.replyingBar}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                   <CornerDownRight size={16} color="#666" style={{marginRight: 8}}/>
                   <Text style={styles.replyingText} numberOfLines={1}>
                     Đang trả lời <Text style={{fontWeight: 'bold'}}>{replyingTo.username}</Text>: "{replyingTo.content}"
                   </Text>
                </View>
                <TouchableOpacity onPress={handleCancelReply}>
                  <X size={18} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Input chính */}
            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={replyingTo ? "Viết câu trả lời..." : "Viết bình luận..."}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                  onPress={handlePostComment} 
                  disabled={sending || !inputText.trim()}
                  style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
              >
                {sending ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
        
        {/* Report Modal */}
     {selectedCommentId && (
    <ReportModal 
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        targetId={selectedCommentId}
        targetType="Comment"
            />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', height: '80%', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  
  // --- ITEM STYLE ---
  commentItem: { flexDirection: 'row', marginBottom: 16 },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  
  commentContentWrapper: { flex: 1 },
  
  commentBubble: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 12, borderTopLeftRadius: 2 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  username: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  time: { fontSize: 10, color: '#999' },
  textContent: { fontSize: 14, color: '#333', lineHeight: 20 },

  // --- ACTION BAR STYLE (NEW) ---
  actionBar: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 16, paddingLeft: 4 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  actionText: { fontSize: 12, color: '#666', fontWeight: '500' },
  actionTextActive: { color: '#2C6B7C' },
  actionTextReply: { fontSize: 12, color: '#666', fontWeight: '600' },

  // --- FOOTER & INPUT STYLE ---
  footerContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  replyingBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, backgroundColor: '#f0f8ff', paddingHorizontal: 16 },
  replyingText: { fontSize: 12, color: '#555', maxWidth: '85%' },
  
  inputRow: { flexDirection: 'row', padding: 10, alignItems: 'center', marginBottom: Platform.OS === 'ios' ? 20 : 0 },
  input: { flex: 1, backgroundColor: '#f0f2f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, maxHeight: 100, marginRight: 10, fontSize: 15 },
  sendButton: { backgroundColor: '#2C6B7C', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { backgroundColor: '#ccc' },
});