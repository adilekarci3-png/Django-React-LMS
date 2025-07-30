import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Hata oluştuğunda state güncellenir
    return { hasError: true, error };
  }

 componentDidCatch(error, errorInfo) {
  const errorDetails = {
    error: error.toString(),
    stack: errorInfo.componentStack,
    time: new Date().toISOString(),
  };

  // Hem console.log hem storage
  console.error("ErrorBoundary caught an error:", error);
  console.error("Stack:", errorInfo.componentStack);

  // Storage'a yaz (debug için)
  const previousLogs = JSON.parse(localStorage.getItem("appErrors") || "[]");
  previousLogs.push(errorDetails);
  localStorage.setItem("appErrors", JSON.stringify(previousLogs));

  this.setState({ errorInfo });
}

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center mt-5">
          <h1>Bir şeyler yanlış gitti.</h1>
          <p>Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          {process.env.NODE_ENV === "development" && (
            <details className="text-muted small" style={{ whiteSpace: "pre-wrap", textAlign: "left" }}>
              {this.state.error?.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
