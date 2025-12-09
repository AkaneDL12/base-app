import axios from "axios";
import { API_BASE_URL } from "./config";
import { StorageService } from "./storage";
import { Platform } from "react-native";

class UploadService {
  async uploadImage(uri: string) {
    if (!uri) {
      throw new Error("URI de imagen inválida");
    }

    const token = await StorageService.getToken();

    // ARREGLAR URI PARA IOS
    const fixedUri =
      Platform.OS === "android" ? uri : uri.replace("file://", "");

    // NOMBRE Y TIPO DEL ARCHIVO
    let fileName = fixedUri.split("/").pop() || `image-${Date.now()}.jpg`;
    const ext = (fileName.split(".").pop() || "jpg").toLowerCase();

    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    if (ext === "webp") mimeType = "image/webp";

    const formData = new FormData();
    formData.append(
      "file",
      {
        uri: fixedUri,
        name: fileName,
        type: mimeType,
      } as any
    );

    try {
      console.log("📤 [UPLOAD] Enviando a:", `${API_BASE_URL}/upload/image`);

      const res = await axios.post(
        `${API_BASE_URL}/upload/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          timeout: 20000,
        }
      );

      console.log(
        "✅ [UPLOAD] Respuesta /upload/image:",
        res.status,
        res.data
      );

      // PUEDE VENIR COMO { url: 'http://ip:3000/uploads/...' } o { url: '/uploads/...' }
      const rawUrl: string | undefined =
        res.data?.url || res.data?.path || res.data?.location;

      if (!rawUrl) {
        throw new Error("El servidor no devolvió una URL de imagen");
      }

      // SI YA ES ABSOLUTA (http/https), LA USAMOS TAL CUAL
      const finalUrl = rawUrl.startsWith("http")
        ? rawUrl
        : `${API_BASE_URL}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

      console.log("🔗 [UPLOAD] URL final de imagen:", finalUrl);

      return { url: finalUrl };
    } catch (error: any) {
      console.log("❌ [UPLOAD] Error detallado:", {
        message: error?.message,
        code: error?.code,
        status: error?.response?.status,
        data: error?.response?.data,
      });

      // 1) ERROR HTTP (EL SERVIDOR RESPONDIÓ)
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;

        throw new Error(
          `No se pudo subir la imagen (HTTP ${status}: ${
            typeof data === "string" ? data : JSON.stringify(data)
          })`
        );
      }

      // 2) ERROR DE RED (NO HAY RESPUESTA)
      if (error?.request) {
        throw new Error(
          "No se pudo conectar con el servidor. Revisa API_BASE_URL y que el dispositivo esté en la misma red."
        );
      }

      // 3) CUALQUIER OTRA COSA
      throw new Error(error?.message || "No se pudo subir la imagen");
    }
  }
}

export const uploadService = new UploadService();