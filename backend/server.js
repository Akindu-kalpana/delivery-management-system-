const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const authRoutes         = require('./routes/auth');
const deliveryRoutes     = require('./routes/deliveries');
const chatbotRoutes      = require('./routes/chatbot');
const priceEstimateRoutes = require('./routes/priceEstimate');
const savedAddressRoutes = require('./routes/savedAddresses');
const complaintsRoutes   = require('./routes/complaints');
const damageClaimsRoutes = require('./routes/damageClaims');
const bulkOrdersRoutes   = require('./routes/bulkOrders');
const loyaltyRoutes      = require('./routes/loyalty');
const adminRoutes        = require('./routes/admin');

app.use('/api/auth',           authRoutes);
app.use('/api/deliveries',     deliveryRoutes);
app.use('/api/chatbot',        chatbotRoutes);
app.use('/api/price',          priceEstimateRoutes);
app.use('/api/addresses',      savedAddressRoutes);
app.use('/api/complaints',     complaintsRoutes);
app.use('/api/damage-claims',  damageClaimsRoutes);
app.use('/api/bulk',           bulkOrdersRoutes);
app.use('/api/loyalty',        loyaltyRoutes);
app.use('/api/admin',          adminRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'NKR Delivery API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
