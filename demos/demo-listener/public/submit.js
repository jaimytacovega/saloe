const submit = ({ e, srcElement }) => {
    e.preventDefault()
    console.log('--- srcElement =', srcElement)
}

export { submit }