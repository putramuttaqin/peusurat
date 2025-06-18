import { render } from 'preact'
import './index.css'
import { Router } from 'preact-router'
import { HomePage } from './pages/HomePage.jsx'
import { FormPage } from './pages/FormPage.jsx'

render(
  <Router>
    <HomePage path="/" />
    <FormPage path="/form" />
  </Router>,
  document.getElementById('app')
)
