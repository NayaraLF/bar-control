import { useState } from 'react'
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete } from '@mui/icons-material'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useCollection } from '../../hooks/useFirestore'
import type { Category } from '../../types'

export default function CategoryTab() {
  const { data: categories, loading } = useCollection<Category>('categories', 'name')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

  function openAdd() {
    setEditingId(null)
    setName('')
    setDialogOpen(true)
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id)
    setName(cat.name)
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), { name: name.trim() })
      } else {
        await addDoc(collection(db, 'categories'), { name: name.trim() })
      }
      setDialogOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await deleteDoc(doc(db, 'categories', deleteTarget.id))
    setDeleteTarget(null)
  }

  if (loading) return <Typography>Carregando...</Typography>

  return (
    <Box>
      {categories.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Nenhuma categoria cadastrada. Toque no botão + para adicionar.
        </Alert>
      ) : (
        <List>
          {categories.map((cat) => (
            <ListItem
              key={cat.id}
              secondaryAction={
                <Box>
                  <IconButton onClick={() => openEdit(cat)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => setDeleteTarget(cat)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText primary={cat.name} />
            </ListItem>
          ))}
        </List>
      )}

      <Fab
        color="primary"
        onClick={openAdd}
        sx={{ position: 'fixed', bottom: { xs: 80, md: 24 }, right: 24 }}
      >
        <Add />
      </Fab>

      {/* Dialog add/edit */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da categoria"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !name.trim()}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmação de exclusão */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Excluir categoria?</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
