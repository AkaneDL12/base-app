import { BaseApiService, ApiResponse } from './base-api';
import { API_CONFIG, ENDPOINTS } from './config';
import axios from "axios";
import { API_BASE_URL } from "./config";
import { StorageService } from "./storage";

export interface Post {
  _id: string;
  content: string;
  mediaUrls?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  authorId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  likes: string[]; // Array de IDs de usuarios que dieron like
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreatePostDto {
  content: string;
  mediaUrls?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

export interface Comment {
  _id: string;
  postId: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  likes: string[];
  parentCommentId?: string;
  createdAt: string;
  isDeleted: boolean;
}

class PostService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  private async getAuthHeaders() {
    const token = await StorageService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Crear post
  async createPost(data: CreatePostDto) {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('📤 [FRONTEND] Enviando post:', JSON.stringify(data, null, 2));
      
      const res = await this.api.post("/posts", data, { headers });
      
      console.log('✅ [FRONTEND] Post creado exitosamente:', JSON.stringify(res.data, null, 2));
      
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al crear post:", err?.response?.data || err);
      throw err;
    }
  }

  // Obtener feed
  async getFeed(limit: number = 20, skip: number = 0) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.get(`/posts/feed?limit=${limit}&skip=${skip}`, { headers });
      
      console.log('📥 [FRONTEND] Posts recibidos del feed:');
      console.log('  - Total posts:', res.data.length);
      if (res.data.length > 0) {
        console.log('  - Primer post:', JSON.stringify(res.data[0], null, 2));
      }
      
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al obtener feed:", err?.response?.data || err);
      throw err;
    }
  }

  // Obtener posts de un usuario
  async getUserPosts(userId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.get(`/posts/user/${userId}`, { headers });
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al obtener posts del usuario:", err?.response?.data || err);
      throw err;
    }
  }

  // Obtener post por ID
  async getPostById(postId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.get(`/posts/${postId}`, { headers });
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al obtener post:", err?.response?.data || err);
      throw err;
    }
  }

  // Dar/quitar like
  async toggleLike(postId: string) {
    try {
      const headers = await this.getAuthHeaders();
      console.log(`👍 [FRONTEND]Toggling like en post ${postId}`);
      const res = await this.api.post(`/posts/${postId}/like`, {}, { headers });
      console.log('✅ [FRONTEND] Like actualizado:', res.data);
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al dar like:", err?.response?.data || err);
      throw err;
    }
  }

  // Crear comentario
  async createComment(postId: string, data: CreateCommentDto) {
    try {
      const headers = await this.getAuthHeaders();
      console.log(`💬 [FRONTEND] Creando comentario en post ${postId}:`, data);
      const res = await this.api.post(`/posts/${postId}/comments`, data, { headers });
      console.log('✅ [FRONTEND] Comentario creado:', res.data);
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al crear comentario:", err?.response?.data || err);
      throw err;
    }
  }

  // Obtener comentarios
  async getPostComments(postId: string): Promise<Comment[]> {
    try {
      const headers = await this.getAuthHeaders();
      const res = await this.api.get(`/posts/${postId}/comments`, { headers });
      console.log(`📥 [FRONTEND] Comentarios recibidos para post ${postId}:`, res.data.length);
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al obtener comentarios:", err?.response?.data || err);
      throw err;
    }
  }

  // Actualizar post
  async updatePost(postId: string, data: Partial<CreatePostDto>) {
    try {
      const headers = await this.getAuthHeaders();
      console.log(`✏️ [FRONTEND] Actualizando post ${postId}:`, JSON.stringify(data, null, 2));
      const res = await this.api.put(`/posts/${postId}`, data, { headers });
      console.log('✅ [FRONTEND] Post actualizado:', res.data);
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al actualizar post:", err?.response?.data || err);
      throw err;
    }
  }

  // Eliminar post
  async deletePost(postId: string) {
    try {
      const headers = await this.getAuthHeaders();
      console.log(`🗑️ [FRONTEND] Eliminando post ${postId}`);
      const res = await this.api.delete(`/posts/${postId}`, { headers });
      console.log('✅ [FRONTEND] Post eliminado');
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al eliminar post:", err?.response?.data || err);
      throw err;
    }
  }

  // Dar/quitar like a comentario
  async toggleCommentLike(commentId: string) {
    try {
      const headers = await this.getAuthHeaders();
      console.log(`👍 [FRONTEND] Toggling like en comentario ${commentId}`);
      const res = await this.api.post(`/posts/comments/${commentId}/like`, {}, { headers });
      console.log('✅ [FRONTEND] Like en comentario actualizado');
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al dar like al comentario:", err?.response?.data || err);
      throw err;
    }
  }

  // Eliminar comentario
  async deleteComment(commentId: string) {
    try {
      const headers = await this.getAuthHeaders();
      console.log(`🗑️ [FRONTEND] Eliminando comentario ${commentId}`);
      const res = await this.api.delete(`/posts/comments/${commentId}`, { headers });
      console.log('✅ [FRONTEND] Comentario eliminado');
      return res.data;
    } catch (err: any) {
      console.error("❌ [FRONTEND] Error al eliminar comentario:", err?.response?.data || err);
      throw err;
    }
  }
}

export const postService = new PostService();