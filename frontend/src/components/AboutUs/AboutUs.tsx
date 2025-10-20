
const AboutUs = () => {
  return (
    <section className="aboutus-section">
      <div className="aboutus-container">
        <div className="aboutus-image">
          {/* Replace with your image source */}
          <img src="/images/about-us-image.png" alt="About Us" />
        </div>
        <div className="aboutus-content">
          <h2>About Us</h2>
          <p>
            Welcome to <strong>TenniPay Wallet</strong> — your tool to manage money online with ease, security, and speed.
          </p>
          <p>
            We built this wallet so you can shop, transfer, and track all in one place. Our goal? To give you full control without the stress.
          </p>
          <p>
            With encrypted transactions, real-time updates, and 24/7 support, we’re here to make your financial experience seamless.  
            Trust, transparency, and usability are at the heart of everything we do.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
