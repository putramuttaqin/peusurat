import { render } from 'preact'
import './index.css'
import { Router } from 'preact-router'
import { HomePage } from './pages/HomePage.jsx'
import { FormPage } from './pages/FormPage.jsx'
import { EntriesPage } from './pages/EntriesPage.jsx';

render(
  <Router>
    <HomePage path="/" />
    <FormPage path="/form" />
    <EntriesPage path="/entries" />
  </Router>,
  document.getElementById('app')
)
