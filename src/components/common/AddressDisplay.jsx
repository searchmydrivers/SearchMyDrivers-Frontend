const AddressDisplay = ({ location, className = "", showCity = true }) => {
  // Use backend-provided address directly - no Google Maps API calls needed
  const getDisplayAddress = () => {
    if (!location) return 'N/A';

    // Use the address from backend
    let display = location.address || 'N/A';

    // Optionally append city if requested and not already in address
    if (showCity && location.city && !display.toLowerCase().includes(location.city.toLowerCase())) {
      display += `, ${location.city}`;
    }

    return display;
  };

  const displayAddress = getDisplayAddress();

  return (
    <div className={className} title={displayAddress}>
      {displayAddress}
    </div>
  );
};

export default AddressDisplay;
