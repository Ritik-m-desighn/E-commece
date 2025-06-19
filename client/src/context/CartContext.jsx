// context/CartContext.jsx
'use client';

import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // Import AuthContext to potentially link cart to user if needed later

// Create the Cart Context
export const CartContext = createContext(null);

// Cart Provider component
export function CartProvider({ children }) {
  // State to hold the cart items
  // Each item will typically be { productId, name, price, imageUrl, quantity }
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for initial localStorage check

  // Access user from AuthContext (useful if you decide to link carts to users later)
  const { user } = useContext(AuthContext);

  // Effect to load cart items from localStorage on initial render
  useEffect(() => {
    try {
      // Get cart items from localStorage
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        // Parse the JSON string back into an array
        setCartItems(JSON.parse(storedCart));
        console.log("[CartContext useEffect] Loaded cart from localStorage.");
      } else {
        console.log("[CartContext useEffect] No cart found in localStorage.");
      }
    } catch (e) {
      console.error("[CartContext useEffect] Error loading cart from localStorage:", e);
      // Clear localStorage if parsing fails to prevent future errors
      localStorage.removeItem('cartItems');
    } finally {
      setLoading(false); // Finished loading cart from storage
    }
  }, []); // Empty dependency array means this runs only once on mount

  // Effect to save cart items to localStorage whenever cartItems state changes
  useEffect(() => {
    if (!loading) { // Only save once initial load is complete
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      console.log("[CartContext useEffect] Cart updated, saved to localStorage.");
    }
  }, [cartItems, loading]); // Runs whenever cartItems or loading changes

  // Function to add an item to the cart
  const addToCart = (product, quantity = 1) => {
    // Check if the product already exists in the cart
    const existingItemIndex = cartItems.findIndex(item => item.productId === product._id);

    if (existingItemIndex > -1) {
      // If item exists, update its quantity
      const updatedCartItems = cartItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setCartItems(updatedCartItems);
      console.log(`[CartContext] Updated quantity for ${product.title}.`);
    } else {
      // If item is new, add it to the cart
      const newItem = {
        productId: product._id,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock, // Include stock to prevent adding more than available
        quantity: quantity,
      };
      setCartItems([...cartItems, newItem]);
      console.log(`[CartContext] Added ${product.title} to cart.`);
    }
  };

  // Function to remove an item from the cart completely
  const removeFromCart = (productId) => {
    const updatedCartItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCartItems);
    console.log(`[CartContext] Removed product ID ${productId} from cart.`);
  };

  // Function to update the quantity of a specific item
  const updateQuantity = (productId, newQuantity) => {
    const updatedCartItems = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedCartItems);
    console.log(`[CartContext] Updated quantity for product ID ${productId} to ${newQuantity}.`);
  };

  // Function to clear the entire cart
  const clearCart = () => {
    setCartItems([]);
    console.log("[CartContext] Cart cleared.");
  };

  // Calculate total number of items in the cart
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Calculate total price of items in the cart
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // The value provided by the CartContext
  const cartContextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice: totalPrice.toFixed(2), // Format to 2 decimal places for display
    loading // Expose loading state
  };

  console.log("[CartContext Render] Current cart state:", cartContextValue);

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
}
