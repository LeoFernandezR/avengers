// getAllCharactersData
const fetchCharacters = async (offset = 0) => {
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
      'https://gateway.marvel.com/v1/public/characters',
      {
        params: {
          limit,
          offset,
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

//Display the hero list from CharactersData
//Depends of fetchCharacters
const displayCharacterList = async (offset) => {
  const heroData = await fetchCharacters(offset)
  const list = document.querySelector('#list')
  list.innerHTML = ''

  const addFavorite = (e) => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites'))
    const idFavorite = e.target.dataset.id

    e.target.classList.remove('btn-danger')
    e.target.classList.add('btn-success')
    e.target.innerHTML = '<i class="fa fa-check-circle"></i>'

    if (!storedFavorites) {
      localStorage.setItem('favorites', JSON.stringify([idFavorite]))

      return
    }

    storedFavorites.push(idFavorite)
    const noDuplicateFavs = [...new Set(storedFavorites)]

    localStorage.setItem('favorites', JSON.stringify(noDuplicateFavs))
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

    const cardNav = document.createElement('nav')
    cardNav.className = 'd-flex justify-content-between flex-row-reverse'
    cardBody.appendChild(cardNav)

    const favoriteButton = document.createElement('a')
    favoriteButton.className = 'btn btn-danger favorite'
    favoriteButton.setAttribute('data-id', id)
    favoriteButton.innerText = 'Favorite'
    favoriteButton.addEventListener('click', addFavorite)
    cardNav.appendChild(favoriteButton)

    const infoButton = document.createElement('a')
    infoButton.className = 'btn btn-info me-2'
    infoButton.href = `../character.html?id=${id}`
    infoButton.setAttribute('data-id', id)
    infoButton.innerText = 'Info'
    cardNav.appendChild(infoButton)

    return card
  }

  heroData.forEach((data) => {
    list.appendChild(cardTemplate(data))
  })
}

// Display the pagination depending on the total amount of data. The API says the total amount of characters.
//Depends of displayCharacterList function
const displayPagination = () => {
  const pageList = document.querySelector('#pagination')
  const numberOfPages = Math.ceil(total / limit)
  pageList.innerHTML = ''

  const onClickPage = (e) => {
    currentPage = parseInt(e.target.dataset.page)
    const newOffset = (e.target.dataset.page - 1) * limit
    displayCharacterList(newOffset)
    displayPagination()
  }

  const generatePageItem = (number) => {
    const pageItem = document.createElement('li')
    pageItem.classList.add('page-item')
    pageItem.addEventListener('click', onClickPage)

    if (currentPage === number) pageItem.classList.add('active')

    const pageLink = document.createElement('a')
    pageLink.classList.add('page-link')
    pageLink.innerText = number
    pageLink.setAttribute('data-page', number)
    pageItem.appendChild(pageLink)

    return pageItem
  }

  for (let i = 1; i <= numberOfPages; i++) {
    pageList.appendChild(generatePageItem(i))
  }
}

//Fetchs data from name
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

//Generates autocomplete
//Depends of fetchCharactersByName function
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
displayPagination()
displayCharacterList()
