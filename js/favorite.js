const fetchCharacterById = async (id) => {
  const structureData = (data) => {
    const resultsArray = data.data.results

    const structuredData = resultsArray.map(
      ({ id, name, description, thumbnail }) => {
        return {
          id,
          name,
          description,
          picture: thumbnail.path,
        }
      }
    )
    return structuredData
  }
  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/characters/${id}`,
      {
        params: {
          ts,
          apikey,
          hash,
        },
      }
    )
    return structureData(response.data)
  } catch (error) {
    console.error(error)
  }
}

const displayFavoriteCharactersList = async () => {
  const storedFavorites = JSON.parse(localStorage.getItem('favorites'))
  const favoritesIds = storedFavorites.map((fav) => parseInt(fav))
  const favsPromises = favoritesIds.map((id) => fetchCharacterById(id))
  const heroData = await Promise.all(favsPromises)

  const list = document.querySelector('#list')
  list.innerHTML = ''

  const deleteFromLocalStorage = (e) => {
    const id = e.target.dataset.id

    const newFavorites = storedFavorites.filter((favId) => favId != id)

    localStorage.setItem('favorites', JSON.stringify(newFavorites))

    displayFavoriteCharactersList()
  }
  const cardTemplate = ({ id, name, picture }) => {
    const card = document.createElement('div')
    card.classList.add('card')
    card.style.width = '100%'

    const img = document.createElement('img')
    img.src = `${picture}/portrait_fantastic.jpg`
    img.classList.add('card-img-top')
    img.style.minHeight = '375px'
    img.alt = name
    img.draggable = false
    card.appendChild(img)

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')
    card.appendChild(cardBody)

    const cardTitle = document.createElement('h5')
    cardTitle.classList.add('card-title')
    cardTitle.innerText = name
    cardBody.appendChild(cardTitle)

    const navFavorite = document.createElement('nav')
    navFavorite.className = 'd-flex justify-content-between flex-row-reverse'
    cardBody.appendChild(navFavorite)

    const deleteButton = document.createElement('a')
    deleteButton.className = 'btn btn-danger'
    deleteButton.setAttribute('data-id', id)
    deleteButton.innerText = 'Remove'
    deleteButton.addEventListener('click', deleteFromLocalStorage)
    navFavorite.appendChild(deleteButton)

    const infoButton = document.createElement('a')
    infoButton.className = 'btn btn-info me-2'
    infoButton.href = `../character.html?id=${id}`
    infoButton.setAttribute('data-id', id)
    infoButton.innerText = 'Info'
    navFavorite.appendChild(infoButton)

    return card
  }

  heroData.forEach((data) => {
    const [favData] = data

    list.appendChild(cardTemplate(favData))
  })
}

const fetchCharactersByName = async (nameStartsWith) => {
  const structureData = (data) => {
    const resultsArray = data.data.results || []

    const structuredData = resultsArray.map(
      ({ id, name, description, thumbnail }) => {
        return {
          id,
          name,
          description,
          picture: thumbnail.path,
        }
      }
    )
    return structuredData
  }
  try {
    const response = await axios.get(
      'https://gateway.marvel.com/v1/public/characters',
      {
        params: {
          nameStartsWith,
          limit,
          ts,
          apikey,
          hash,
        },
      }
    )
    return structureData(response.data)
  } catch (error) {
    console.error(error)
  }
}
const showAutoComplete = () => {
  const debounce = (func, delay = 1000) => {
    let timeoutId
    return (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        func.apply(null, args)
      }, delay)
    }
  }

  const root = document.querySelector('.autocomplete')
  const input = document.querySelector('#searchInput')
  const dropdown = document.querySelector('.dropdown-menu')

  const onInput = async (e) => {
    const items = await fetchCharactersByName(e.target.value)

    if (!items.length) {
      dropdown.classList.remove('d-block')
      return
    }

    dropdown.innerHTML = ''
    dropdown.classList.add('d-block')

    items.forEach(({ id, name }) => {
      const listItem = document.createElement('li')

      const dropdownItem = document.createElement('a')
      dropdownItem.innerText = name
      dropdownItem.href = `../character.html?id=${id}`
      dropdownItem.classList.add('dropdown-item')
      listItem.appendChild(dropdownItem)

      dropdownItem.addEventListener('click', () => {
        dropdown.classList.remove('d-block')
      })

      dropdown.appendChild(listItem)
    })
  }

  input.addEventListener('input', debounce(onInput, 500))

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove('d-block')
    }
  })
}

showAutoComplete()
displayFavoriteCharactersList()
