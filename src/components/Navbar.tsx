import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShoppingCart, User, Menu, X, Heart, Search } from "react-feather";
import { api } from "../api";

export default function Navbar() {
  const { user, isAuthenticated, logout: contextLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown visibility
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(
    null
  ); // Timeout for dropdown

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      contextLogout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout); // Clear any existing timeout
    }
    setIsDropdownOpen(true); // Show the dropdown
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownOpen(false); // Hide the dropdown after a delay
    }, 200); // Adjust the delay as needed (200ms in this case)
    setDropdownTimeout(timeout);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            ShopEase
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium hover:text-indigo-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium hover:text-indigo-600 transition-colors"
            >
              Products
            </Link>
            <Link
              to="/categories"
              className="text-sm font-medium hover:text-indigo-600 transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium hover:text-indigo-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-indigo-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Heart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                3
              </span>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter} // Show dropdown on hover
                onMouseLeave={handleMouseLeave} // Hide dropdown after a delay
              >
                <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                  <User size={20} />
                  <span className="text-sm hidden lg:inline-block">
                    {user?.email}
                  </span>
                </button>
                {isDropdownOpen && ( // Show dropdown if isDropdownOpen is true
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
