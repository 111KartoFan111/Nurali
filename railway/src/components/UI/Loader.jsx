import './Loader.css';

const Loader = ({ message = 'Загрузка...' }) => {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>{message}</p>
      </div>
    );
  };
  
  export default Loader;