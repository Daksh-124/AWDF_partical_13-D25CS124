import React from 'react';

function Header({ name, title }) {
  return (
    <header className="header">
      <h1>{name}</h1>
      <p className="subtitle">{title}</p>
    </header>
  );
}

export default Header;
