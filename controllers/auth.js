// controllers/auth.js - VERSIÓN FINAL
import axios from "axios";

const authController = {
  // ✅ REFRESH TOKEN - FUNCIÓN PRINCIPAL
  refreshToken: async (req, res) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          error: "Refresh token requerido",
          code: "MISSING_REFRESH_TOKEN",
        });
      }

      console.log("🔄 Intentando refrescar token con Factus...");

      const response = await axios.post(
        `${process.env.FACTUS_API_URL || "https://api-sandbox.factus.com.co"}/auth/refresh`,
        { refresh_token },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ Token refrescado exitosamente");

      res.json({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        success: true,
      });
    } catch (error) {
      console.error("❌ Error al refrescar token:", error.response?.data || error.message);

      const status = error.response?.status || 500;
      const errorData = error.response?.data;

      if (status === 401 || status === 403) {
        return res.status(401).json({
          error: "Refresh token inválido o expirado",
          code: "INVALID_REFRESH_TOKEN",
          details: "Debe iniciar sesión nuevamente",
        });
      }

      res.status(status).json({
        error: "Error al refrescar token",
        code: "REFRESH_TOKEN_ERROR",
        details: errorData?.message || error.message,
      });
    }
  },

  // ✅ LOGIN ALTERNATIVO (Proxy a Factus)
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: "Email y contraseña requeridos",
          code: "MISSING_CREDENTIALS",
        });
      }

      console.log("🔐 Intentando login con Factus...");

      const response = await axios.post(
        `${process.env.FACTUS_API_URL || "https://api-sandbox.factus.com.co"}/auth/login`,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("✅ Login exitoso");

      res.json({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        user: response.data.user,
        success: true,
      });
    } catch (error) {
      console.error("❌ Error en login:", error.response?.data || error.message);

      const status = error.response?.status || 500;
      const errorData = error.response?.data;

      if (status === 401) {
        return res.status(401).json({
          error: "Credenciales inválidas",
          code: "INVALID_CREDENTIALS",
        });
      }

      res.status(status).json({
        error: "Error en el servidor de autenticación",
        code: "AUTH_SERVER_ERROR",
        details: errorData?.message || error.message,
      });
    }
  },

  // ✅ VERIFICAR TOKEN
  verifyToken: async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          error: "Token requerido",
          code: "MISSING_TOKEN",
        });
      }

      const token = authHeader.split(" ")[1];

      const response = await axios.get(
        `${process.env.FACTUS_API_URL || "https://api-sandbox.factus.com.co"}/v1/auth/verify`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      );

      res.json({
        valid: true,
        user: response.data.user,
        expires_at: response.data.expires_at,
      });
    } catch (error) {
      console.error("❌ Error verificando token:", error.response?.data || error.message);

      const status = error.response?.status || 500;

      if (status === 401) {
        return res.status(401).json({
          valid: false,
          error: "Token inválido o expirado",
          code: "INVALID_TOKEN",
        });
      }

      res.status(status).json({
        valid: false,
        error: "Error verificando token",
        code: "TOKEN_VERIFICATION_ERROR",
      });
    }
  },

  // ✅ PROXY PARA DATOS DE FACTUS
  getFactusData: async (req, res) => {
    try {
      const { endpoint } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return res.status(401).json({
          error: "Token requerido",
          code: "MISSING_TOKEN",
        });
      }

      const validEndpoints = [
        "municipalities",
        "measurement-units",
        "tributes/products",
        "tributes/customers",
        "identification-documents",
        "legal-organizations",
      ];

      if (!validEndpoints.includes(endpoint)) {
        return res.status(400).json({
          error: "Endpoint no válido",
          code: "INVALID_ENDPOINT",
        });
      }

      console.log(`🔄 Obteniendo datos de Factus: ${endpoint}`);

      const response = await axios.get(
        `${process.env.FACTUS_API_URL || "https://api-sandbox.factus.com.co"}/v1/${endpoint}`,
        {
          headers: { Authorization: authHeader },
          params: req.query,
          timeout: 30000,
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error(`❌ Error obteniendo ${req.params.endpoint}:`, error.response?.data || error.message);

      const status = error.response?.status || 500;

      if (status === 401) {
        return res.status(401).json({
          error: "Token expirado",
          code: "TOKEN_EXPIRED",
        });
      }

      res.status(status).json({
        error: `Error obteniendo ${req.params.endpoint}`,
        code: "FACTUS_API_ERROR",
        details: error.response?.data?.message || error.message,
      });
    }
  },

  // ✅ OAUTH2 TOKEN (para tu Login.vue) - VERSIÓN FINAL
 // ✅ FUNCIÓN OAUTH TOKEN ACTUALIZADA - MANEJA LOGIN Y REFRESH
oauthToken: async (req, res) => {
  try {
    const { username, password, grant_type, client_id, client_secret, refresh_token } = req.body;

    // ✅ DETERMINAR TIPO DE PETICIÓN
    if (grant_type === "password") {
      console.log("🔐 Proxy OAuth2 LOGIN a Factus...");
    } else if (grant_type === "refresh_token") {
      console.log("🔄 Proxy OAuth2 REFRESH TOKEN a Factus...");
    } else {
      return res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Solo se soporta 'password' y 'refresh_token'"
      });
    }

    // ✅ PREPARAR PAYLOAD SEGÚN EL TIPO
    let payload = {
      grant_type,
      client_id,
      client_secret
    };

    if (grant_type === "password") {
      payload.username = username;
      payload.password = password;
    } else if (grant_type === "refresh_token") {
      payload.refresh_token = refresh_token;
    }

    // ✅ ENVIAR A FACTUS (MISMO ENDPOINT PARA AMBOS)
    const response = await axios.post(
      `${process.env.FACTUS_API_URL || "https://api-sandbox.factus.com.co"}/oauth/token`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );

    if (grant_type === "password") {
      console.log("✅ OAuth2 login exitoso");
    } else {
      console.log("✅ OAuth2 refresh token exitoso");
    }

    // ✅ DEVOLVER EXACTAMENTE LA MISMA RESPUESTA QUE FACTUS
    res.json(response.data);
  } catch (error) {
    const errorType = req.body.grant_type === "refresh_token" ? "refresh token" : "login";
    console.error(`❌ Error en OAuth2 ${errorType}:`, error.response?.data || error.message);

    const status = error.response?.status || 500;
    const errorData = error.response?.data;

    if (status === 401) {
      return res.status(401).json({
        error: "invalid_credentials",
        error_description: errorType === "refresh token" 
          ? "Refresh token inválido o expirado" 
          : "Las credenciales proporcionadas son incorrectas",
      });
    }

    res.status(status).json(
      errorData || {
        error: "server_error",
        error_description: "Error interno del servidor",
      }
    );
  }
}
};

export default authController;