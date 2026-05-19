const express = require('express');
const router  = express.Router();
const Stripe  = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── POST /api/stripe/create-checkout ─────────────────────────────────────────
// Creates a Stripe Checkout session for the Pro subscription (₹2,999/month)
router.post('/create-checkout', async (req, res) => {
  const { uid, email, name } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'uid and email are required' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment', // one-time for simplicity; change to 'subscription' for recurring
      customer_email: email,
      metadata: { uid, userName: name || '' },
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: 299900, // ₹2,999 in paise
            product_data: {
              name: 'ResumeAI Pro — 30-Day Access',
              description: '10 resume downloads + 7 premium templates for 30 days',
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${CLIENT_URL}/?cancelled=1`,
      locale: 'auto',
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[Stripe] create-checkout error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/stripe/verify-session ───────────────────────────────────────────
// Verifies a completed Stripe Checkout session and returns subscription info.
// The client writes the resulting doc to Firestore after receiving this response.
router.get('/verify-session', async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'session_id is required' });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment not completed' });
    }

    const uid = session.metadata?.uid;
    if (!uid) return res.status(400).json({ error: 'Missing uid in session metadata' });

    const now   = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

    res.json({
      verified: true,
      uid,
      stripeSessionId:    session.id,
      stripeCustomerId:   session.customer || null,
      subscriptionStart:  now.toISOString(),
      periodStart:        now.toISOString(),
      periodEnd:          periodEnd.toISOString(),
      amountPaid:         session.amount_total, // in paise
      currency:           session.currency,
    });
  } catch (err) {
    console.error('[Stripe] verify-session error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
