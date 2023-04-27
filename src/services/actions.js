import { COLS } from "../models/board.enum"
import { Piece } from "../models/piece.class"
import { PIECES } from "../models/pieces.enum"

export const initialTeam = (color) => {
    const pawns = Array(COLS).fill(0).map((col, i) => new Piece(PIECES.PAWN, color, { x: i, y: color === "white" ? 6 : 1 }))
    const rooks = [new Piece(PIECES.ROOK, color, { x: 0, y: color === "white" ? 7 : 0 }), new Piece(PIECES.ROOK, color, { x: 7, y: color === "white" ? 7 : 0 })]
    const knights = [new Piece(PIECES.KNIGHT, color, { x: 1, y: color === "white" ? 7 : 0 }), new Piece(PIECES.KNIGHT, color, { x: 6, y: color === "white" ? 7 : 0 })]
    const bishops = [new Piece(PIECES.BISHOP, color, { x: 2, y: color === "white" ? 7 : 0 }), new Piece(PIECES.BISHOP, color, { x: 5, y: color === "white" ? 7 : 0 })]
    const queen = [new Piece(PIECES.QUEEN, color, { x: 3, y: color === "white" ? 7 : 0 })]
    const king = [new Piece(PIECES.KING, color, { x: 4, y: color === "white" ? 7 : 0 })]

    return [...pawns, ...rooks, ...knights, ...bishops, ...queen, ...king]
}

export const organizeBoard = (pieces, board) => {
    return board.map((row, i) => row.map((col, j) => {
        const piece = pieces.find(piece => piece.position.x === j && piece.position.y === i)
        if (piece && piece.active) {
            return piece
        } else {
            return ""
        }
    }))
}

const longMoves = (piece, board) => {
    const { x, y } = piece.position
    const moves = piece.moves
    const possibleMoves = []
    moves.forEach(move => {
        let i = 1
        while (i < COLS && board[y + (move.y * i)]?.[x + (move.x * i)] !== undefined) {
            const p = board[y + (move.y * i)]?.[x + (move.x * i)]
            if (p && p.color === piece.color) {
                break
            } else if (p && p.color !== piece.color) {
                possibleMoves.push({ x: (move.x * i), y: (move.y * i) })
                break
            } else {
                possibleMoves.push({ x: (move.x * i), y: (move.y * i) })
            }
            i++
        }
    })
    return possibleMoves
}

const possibleDestiny = (piece, board) => {
    const { x, y } = piece?.position
    const possibleMoves = piece.name === "king" || piece.name === "knight"
        ? piece.moves
        : longMoves(piece, board)
    const possibleDestination = possibleMoves.map(move => ({ x: x + move.x, y: y + move.y }))
    return possibleDestination.filter(position => {
        const { x, y } = position
        if (x >= 0 && x < COLS && y >= 0 && y < COLS) {
            const p = board[y][x]
            if (p && p.color === piece.color) {
                return false
            } else {
                return true
            }
        }
        return false
    })
}

const possiblePawnDestiny = (piece, board) => {
    const { x, y } = piece.position
    const possibleMoves = piece.moves
    return possibleMoves.reduce((acc, move) => {
        if (piece.color === "white") {
            const p = board[y - move.y]?.[x + move.x]
            if (p?.color === piece.color) {
                return acc
            } else if (move.x !== 0 && typeof p === "string") {
                return acc
            } else if (move.y === 2 && y !== 6) {
                return acc
            } else if (move.x === 0 && typeof p !== "string") {
                return acc
            } else {
                return [...acc, { x: x + move.x, y: y - move.y }]
            }
        } else {
            const p = board[y + move.y]?.[x + move.x]
            if (p?.color === piece.color) {
                return acc
            } else if (move.x !== 0 && typeof p === "string") {
                return acc
            } else if (move.y === 2 && y !== 1) {
                return acc
            } else if (move.x === 0 && typeof p !== "string") {
                return acc
            } else {
                return [...acc, { x: x + move.x, y: y + move.y }]
            }
        }
    }
    , [])
}

const cleanBoard = (board) => {
    return board.map(row => row.map(col => {
        return typeof col === "string" ? "" : { ...col, show: false }
    }))
}

export const movePiece = (piece, movement, board) => {
    const { x, y } = movement
    const newBoard = cleanBoard(board)
    const possibleDestination = piece?.name === PIECES.PAWN.name
        ? possiblePawnDestiny(piece, newBoard)
        : possibleDestiny(piece, newBoard)
    if (!possibleDestination.some(position => position.x === x && position.y === y)) {
        console.log("Invalid movement")
        return newBoard
    }
    if (piece?.name === PIECES.PAWN.name && (y === 0 || y === 7)) {
        piece = new Piece(PIECES.QUEEN, piece.color, piece.position)
    }
    const newPiece = { ...piece, position: { x, y } }
    newBoard[y][x] = newPiece
    newBoard[piece.position.y][piece.position.x] = ""
    return newBoard
}

export const showPossibleMoves = (piece, board) => {
    const cleanedBoard = cleanBoard(board)
    if (piece === "") {
        return cleanedBoard
    }
    const possibleDestination = piece?.name === PIECES.PAWN.name ? possiblePawnDestiny(piece, cleanedBoard) : possibleDestiny(piece, cleanedBoard)
    const newBoard = cleanedBoard.map((row, i) => row.map((col, j) => {
        if (possibleDestination.some(position => position.x === j && position.y === i)) {
            if (typeof col === "string") return "X"
            else {
                col.show = true
                return col
            }
        }
        if (typeof col === "string") return ""
        else {
            col.show = false
            return col
        }
    }))
    return newBoard
}
