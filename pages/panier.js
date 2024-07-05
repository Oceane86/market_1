// pages/panier.js


import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "../app/styles/panier.css";
import Image from 'next/image';
import { db, auth } from "../config/firebase";  

const products = [
  { name: "Sneaker Pop Culture", price: 480, image: "/images/artist-1.png", description: "Sneaker inspirée de la pop culture." },
  { name: "Sneaker Manga", price: 500, image: "/images/favoris-1.png", description: "Sneaker inspirée des mangas." },
  { name: "Sneaker Minimaliste", price: 450, image: "/images/artist-3.png", description: "Sneaker au design minimaliste." },
  { name: "Sneaker Art Déco", price: 550, image: "/images/artist-4.png", description: "Sneaker avec un design art déco." },
];

export default function Panier() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [user, setUser] = useState(null); 
  const router = useRouter();
  const VAT_RATE = 0.2; 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUser(user);
        const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
        setItems(cartItems);
        updateTotal(cartItems);
      } else {
        router.push("/login");  
      }
    });
    
    return () => unsubscribe();
  }, []);

  const updateTotal = (items) => {
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(totalPrice);
    setVat(totalPrice * VAT_RATE);
  };

  const updateItemQuantity = (index, quantity) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, quantity };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setItems(newItems);
    localStorage.setItem("cart", JSON.stringify(newItems));
    updateTotal(newItems);
  };

  const clearCart = () => {
    setItems([]);
    localStorage.setItem("cart", JSON.stringify([]));
    setTotal(0);
    setVat(0);
  };

  const proceedToCheckout = async () => {
    try {
      const orderData = {
        items: items.map(item => ({ name: item.name, quantity: item.quantity, price: item.price })),
        total: total + vat,
        vat,
        createdAt: new Date(),
        userId: user.uid  
      };

      const docRef = await db.collection('orders').add(orderData);
      console.log('Commande enregistrée avec ID:', docRef.id);

      clearCart();
      router.push("/checkout");
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la commande:', error);
      router.push("/checkout");
    }
  };

  const continueShopping = () => {
    router.push("/");
  };

  if (!user) {
    return <p>Loading...</p>;  
  }

  return (
    <div className="container">
      <h1 className="title">Panier</h1>
      {items.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <div className="cartItems">
          {items.map((item, index) => (
            <div key={index} className="cartItem">
              <div className="imageContainer">
                <img src={item.image} alt={item.name} className="image" />
              </div>
              <div className="details">
                <h2>{item.name}</h2>
                <p>Couleur: pink/white</p>
                <p>Taille: 35</p>
                <p>Prix: {item.price} €</p>
                <div className="quantity">
                  <button onClick={() => updateItemQuantity(index, item.quantity - 1)} className="quantityButton">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateItemQuantity(index, item.quantity + 1)} className="quantityButton">+</button>
                </div>
              </div>
            </div>
          ))}
          <hr className="separator" />
          <div className="summary">
            <div className="priceInfo">
              <p className="deliveryInfo">LIVRAISON : 5 à 8 jours ouvrés</p>
              <p>offerte</p>
            </div>
            <div className="priceInfo">
              <p>PRIX :</p>
              <p>{total} €</p>
            </div>
            <div className="priceInfo">
              <p>Dont TVA Incluse :</p>
              <p>{vat.toFixed(2)} €</p>
            </div>
            <hr className="separator" />
            <div className="totalInfo">
              <p>PRIX TOTAL :</p>
              <p>{(total + vat).toFixed(2)} €</p>
            </div>
            <div className="buttons">
              <button onClick={continueShopping} className="continueButton">Continuer mes achats</button>
              <button onClick={proceedToCheckout} className="checkoutButton">
                <Image src="/images/cb.png" alt="Carte bancaire" width={30} height={30} className="cardIcon" />
                Payer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
