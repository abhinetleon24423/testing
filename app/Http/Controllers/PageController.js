class PageController {
  static about(req, res) {
    return res.render('pages/about');
  }

  static contact(req, res) {
    return res.render('pages/contact');
  }
}

module.exports = PageController;
