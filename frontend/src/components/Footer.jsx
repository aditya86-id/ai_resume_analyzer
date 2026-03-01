export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-12">
      <div className="container text-center text-gray-600 text-sm">
        <p>&copy; {currentYear} AI Resume Analyzer. All rights reserved.</p>
      </div>
    </footer>
  );
}
