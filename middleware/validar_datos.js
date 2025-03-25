export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Accseso denegado. token no encontrado en controllers" });
}
req.token = token;
next();
};