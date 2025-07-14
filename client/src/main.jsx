import { render } from 'preact'
import { Router } from 'preact-router'
import { HomePage } from './pages/HomePage.jsx'
import { FormPage } from './pages/FormPage.jsx'
import { EntriesPage } from './pages/EntriesPage.jsx';
import './styles/index.css'

render(
  <Router>
    <HomePage path="/" />
    <FormPage path="/form" />
    <EntriesPage path="/entries" />
  </Router>,
  document.getElementById('app')
)
