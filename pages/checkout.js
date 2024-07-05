import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import styles from '../app/styles/checkout.css';

export default function Checkout() {
  const [showDelivery, setShowDelivery] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: 'John Doe',
    phone: '+33123456789',
    address: '123 Rue de la Poste',
    address2: '',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    emailAddress: ''
  });
  const [paymentInfo] = useState({
    cardNumber: '**** **** **** 1234',
    expirationDate: '12/24',
    cvv: '***',
    cardHolderName: 'John Doe'
  });
  const [googlePayMessage, setGooglePayMessage] = useState('');
  const [orderSummary] = useState({
    items: [
      { id: 1, name: 'Product 1', price: 25.99, quantity: 2 },
      { id: 2, name: 'Product 2', price: 39.99, quantity: 1 }
      // Ajoutez d'autres articles si nécessaire
    ],
    shippingCost: 5.0,
    tax: 4.5,
    total: 96.47 // Calculé en fonction des articles, frais de livraison et taxes
  });
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async (userId) => {
      try {
        const userDoc = doc(db, 'users', userId);
        const userSnapshot = await getDoc(userDoc);

        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserEmail(userData.email);
        } else {
          setUserEmail('test.user@example.com');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeliveryClick = () => {
    setShowDelivery(true);
  };

  const handleEmailChange = (e) => {
    setDeliveryInfo({ ...deliveryInfo, emailAddress: e.target.value });
  };

  const handleGooglePayClick = () => {
    setGooglePayMessage("L'option Google Pay sera bientôt disponible.");
  };

  const handlePurchase = () => {
    // Actions à exécuter après l'achat
    setPurchaseSuccess(true);
    setTimeout(() => {
      router.push('/'); // Redirection vers la page d'accueil après un court délai
    }, 2000); // Délai en millisecondes avant la redirection
  };

  return (
    <div className={styles.pageContainer}>
      <Head>
        <title>Page de paiement</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.header}>
        {/* Contenu de l'en-tête */}
      </div>

      <div className={styles.checkoutContainer}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${showDelivery ? styles.active : ''}`} onClick={handleDeliveryClick}>Livraison</button>
          <button className={styles.tab}>Paiement</button>
        </div>

        {showDelivery && (
          <div className={styles.deliveryBlock}>
            <h2>Information de livraison</h2>
            <form className={styles.form}>
              <div>
                <label>Nom*</label>
                <div className={styles.readOnlyField}>{deliveryInfo.name}</div>
              </div>

              <div>
                <label>Numéro de téléphone*</label>
                <div className={styles.readOnlyField}>{deliveryInfo.phone}</div>
              </div>

              <div>
                <label>Adresse*</label>
                <div className={styles.readOnlyField}>{deliveryInfo.address}</div>
              </div>

              <div>
                <label>Complément d'adresse (optionnel)</label>
                <div className={styles.readOnlyField}>{deliveryInfo.address2}</div>
              </div>

              <div className={styles.row}>
                <div>
                  <label>Ville*</label>
                  <div className={styles.readOnlyField}>{deliveryInfo.city}</div>
                </div>
                <div>
                  <label>Code postal*</label>
                  <div className={styles.readOnlyField}>{deliveryInfo.postalCode}</div>
                </div>
              </div>

              <div>
                <label>Pays*</label>
                <div className={styles.readOnlyField}>{deliveryInfo.country}</div>
              </div>

              <div>
                <label>Votre adresse email</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={deliveryInfo.emailAddress}
                  onChange={handleEmailChange}
                  placeholder="Votre adresse email"
                />
              </div>
            </form>
          </div>
        )}

        {/* Bloc d'informations de paiement */}
        <div className={styles.paymentBlock}>
          <h2>Information de paiement</h2>
          <div className={styles.form}>
            <div>
              <label>Numéro de carte*</label>
              <div className={styles.readOnlyField}>{paymentInfo.cardNumber}</div>
            </div>

            <div className={styles.row}>
              <div>
                <label>Date d'expiration*</label>
                <div className={styles.readOnlyField}>{paymentInfo.expirationDate}</div>
              </div>
              <div>
                <label>CVV*</label>
                <div className={styles.readOnlyField}>{paymentInfo.cvv}</div>
              </div>
            </div>

            <div>
              <label>Titulaire de la carte*</label>
              <div className={styles.readOnlyField}>{paymentInfo.cardHolderName}</div>
            </div>

            {/* Options de paiement */}
            <div className={styles.paymentOptions}>
              <button className={styles.googlePayButton} onClick={handleGooglePayClick}>
                Google Pay
              </button>
              {/* Ajoutez d'autres boutons pour Apple Pay, PayPal, etc. */}
            </div>

            {/* Message pour Google Pay */}
            {googlePayMessage && (
              <div className={styles.googlePayMessage}>
                {googlePayMessage}
              </div>
            )}

            {/* Récapitulatif de la commande */}
            <div className={styles.orderSummary}>
              <h2>Récapitulatif de la commande</h2>
              <div className={styles.orderItems}>
                {orderSummary.items.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <span>{item.name}</span>
                    <span>{item.quantity} x {item.price.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className={styles.orderDetails}>
                <div>
                  <span>Frais de livraison</span>
                  <span>{orderSummary.shippingCost.toFixed(2)} €</span>
                </div>
                <div>
                  <span>Taxe</span>
                  <span>{orderSummary.tax.toFixed(2)} €</span>
                </div>
                <div className={styles.totalAmount}>
                  <span>Total</span>
                  <span>{orderSummary.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'achat */}
        <div className={styles.purchaseButtonContainer}>
          {!purchaseSuccess && (
            <button className={styles.purchaseButton} onClick={handlePurchase}>
              Acheter
            </button>
          )}
          {purchaseSuccess && (
            <div className={styles.purchaseSuccessMessage}>
              Votre achat a été effectué avec succès !
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
