export const validateLogin = (req, res, next) => {
  const { username } = req.body;
  if (
    !username ||
    typeof username !== "string" ||
    username.trim().length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Username is required and must be non-empty string" });
  }
  req.body.username = username.trim();
  next();
};

export const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  if (
    !refreshToken ||
    typeof refreshToken !== "string" ||
    refreshToken.trim().length === 0
  ) {
    return res.status(400).json({
      error: "Refresh token is required and must be a non-empty string",
    });
  }
  req.body.refreshToken = refreshToken.trim();
  next();
};

export const validateConfiguration = (req, res, next) => {
  const { configuration_url } = req.body;
  if (
    !configuration_url ||
    typeof configuration_url !== "string" ||
    configuration_url.trim().length === 0
  ) {
    return res.status(400).json({
      error: "Configuration URL is required and must be a non-empty string",
    });
  }
  try {
    new URL(configuration_url);
  } catch (error) {
    return res.status(400).json({
      error: "Configuration URL must be a valid URL",
    });
  }
  req.body.configuration_url = configuration_url.trim();
  next();
};

export const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  req.params.id = Number(id);
  next();
};
