/**
 * BruteForce Tool - Interface Utilisateur
 * =======================================
 * 
 * Développé par : MABIALA EULOGE JUNIOR
 * Date de création : 2025
 * 
 * Interface utilisateur moderne pour l'application de brute force avancée
 * avec support des attaques basées sur des règles, craquage de hash GPU,
 * et gestion complète des dictionnaires.
 * 
 * Technologies utilisées :
 * - React 19.1.0
 * - Tailwind CSS 4.1.7
 * - Radix UI Components
 * - Vite 6.3.5
 * 
 * Copyright (c) 2025 MABIALA EULOGE JUNIOR
 * Tous droits réservés.
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Shield, Play, Square, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import './App.css'

function App() {
  // Informations sur le développeur
  const APP_INFO = {
    author: 'MABIALA EULOGE JUNIOR',
    version: '1.0.0',
    description: 'Application de Brute Force Avancée'
  }

  const [attackConfig, setAttackConfig] = useState({
    attack_id: '',
    attack_type: 'simple_string',
    charset: 'ascii_lowercase',
    custom_charset: '',
    min_length: 1,
    max_length: 4,
    target_params: {
      target_string: '',
      hash: '',
      hash_type: 'md5',
      url: '',
      username: ''
    }
  })

  const [attackStatus, setAttackStatus] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Génération d'un ID d'attaque unique
  const generateAttackId = () => {
    return 'attack_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Polling pour récupérer le statut de l'attaque
  useEffect(() => {
    let interval
    if (isRunning && attackConfig.attack_id) {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/attack_status/${attackConfig.attack_id}`)
          if (response.ok) {
            const status = await response.json()
            setAttackStatus(status)
            if (!status.running) {
              setIsRunning(false)
              if (status.found_password) {
                setSuccess(`Mot de passe trouvé : ${status.found_password}`)
              } else {
                setError('Attaque terminée sans résultat')
              }
            }
          } else if (response.status === 404) {
            // L'attaque n'existe plus (terminée et nettoyée)
            setIsRunning(false)
          }
        } catch (err) {
          console.error('Erreur lors de la récupération du statut:', err)
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning, attackConfig.attack_id])

  const handleStartAttack = async () => {
    setError('')
    setSuccess('')
    
    const attackId = generateAttackId()
    const configWithId = { ...attackConfig, attack_id: attackId }
    
    try {
      const response = await fetch('/api/start_attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configWithId),
      })

      if (response.ok) {
        setAttackConfig(configWithId)
        setIsRunning(true)
        setAttackStatus({ running: true, attempts: 0, elapsed_time: 0, found_password: null })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du démarrage de l\'attaque')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    }
  }

  const handleStopAttack = async () => {
    try {
      const response = await fetch('/api/stop_attack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attack_id: attackConfig.attack_id }),
      })

      if (response.ok) {
        setIsRunning(false)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors de l\'arrêt de l\'attaque')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">BruteForce Tool</h1>
          </div>
          <p className="text-slate-300">Outil de test de sécurité pour l'éducation et les tests autorisés</p>
        </div>

        {/* Avertissement */}
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-200">
            <strong>Avertissement :</strong> Cet outil est destiné uniquement à des fins éducatives et de test de sécurité autorisé. 
            L'utilisation non autorisée contre des systèmes tiers est illégale et contraire à l'éthique.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configuration de l'attaque</CardTitle>
              <CardDescription className="text-slate-300">
                Configurez les paramètres de votre test de brute force
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type d'attaque */}
              <div className="space-y-2">
                <Label className="text-white">Type d'attaque</Label>
                <Select 
                  value={attackConfig.attack_type} 
                  onValueChange={(value) => setAttackConfig({...attackConfig, attack_type: value})}
                  disabled={isRunning}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="simple_string">Chaîne simple</SelectItem>
                    <SelectItem value="hash_crack">Craquage de hash</SelectItem>
                    <SelectItem value="http_basic_auth">HTTP Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jeu de caractères */}
              <div className="space-y-2">
                <Label className="text-white">Jeu de caractères</Label>
                <Select 
                  value={attackConfig.charset} 
                  onValueChange={(value) => setAttackConfig({...attackConfig, charset: value})}
                  disabled={isRunning}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="ascii_lowercase">Minuscules (a-z)</SelectItem>
                    <SelectItem value="ascii_uppercase">Majuscules (A-Z)</SelectItem>
                    <SelectItem value="digits">Chiffres (0-9)</SelectItem>
                    <SelectItem value="printable">Tous caractères imprimables</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {attackConfig.charset === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-white">Caractères personnalisés</Label>
                  <Input
                    value={attackConfig.custom_charset}
                    onChange={(e) => setAttackConfig({
                      ...attackConfig, 
                      custom_charset: e.target.value
                    })}
                    placeholder="abc123"
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={isRunning}
                  />
                </div>
              )}

              {/* Longueur */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Longueur min</Label>
                  <Input
                    type="number"
                    value={attackConfig.min_length}
                    onChange={(e) => setAttackConfig({
                      ...attackConfig, 
                      min_length: parseInt(e.target.value) || 1
                    })}
                    min="1"
                    max="10"
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={isRunning}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Longueur max</Label>
                  <Input
                    type="number"
                    value={attackConfig.max_length}
                    onChange={(e) => setAttackConfig({
                      ...attackConfig, 
                      max_length: parseInt(e.target.value) || 1
                    })}
                    min="1"
                    max="10"
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={isRunning}
                  />
                </div>
              </div>

              {/* Paramètres spécifiques au type d'attaque */}
              {attackConfig.attack_type === 'simple_string' && (
                <div className="space-y-2">
                  <Label className="text-white">Chaîne cible</Label>
                  <Input
                    value={attackConfig.target_params.target_string}
                    onChange={(e) => setAttackConfig({
                      ...attackConfig,
                      target_params: { ...attackConfig.target_params, target_string: e.target.value }
                    })}
                    placeholder="password123"
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={isRunning}
                  />
                </div>
              )}

              {attackConfig.attack_type === 'hash_crack' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">Type de hash</Label>
                    <Select 
                      value={attackConfig.target_params.hash_type} 
                      onValueChange={(value) => setAttackConfig({
                        ...attackConfig,
                        target_params: { ...attackConfig.target_params, hash_type: value }
                      })}
                      disabled={isRunning}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="md5">MD5</SelectItem>
                        <SelectItem value="sha1">SHA1</SelectItem>
                        <SelectItem value="sha256">SHA256</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Hash cible</Label>
                    <Input
                      value={attackConfig.target_params.hash}
                      onChange={(e) => setAttackConfig({
                        ...attackConfig,
                        target_params: { ...attackConfig.target_params, hash: e.target.value }
                      })}
                      placeholder="5d41402abc4b2a76b9719d911017c592"
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isRunning}
                    />
                  </div>
                </>
              )}

              {attackConfig.attack_type === 'http_basic_auth' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">URL</Label>
                    <Input
                      value={attackConfig.target_params.url}
                      onChange={(e) => setAttackConfig({
                        ...attackConfig,
                        target_params: { ...attackConfig.target_params, url: e.target.value }
                      })}
                      placeholder="http://example.com/protected"
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isRunning}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Nom d'utilisateur</Label>
                    <Input
                      value={attackConfig.target_params.username}
                      onChange={(e) => setAttackConfig({
                        ...attackConfig,
                        target_params: { ...attackConfig.target_params, username: e.target.value }
                      })}
                      placeholder="admin"
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={isRunning}
                    />
                  </div>
                </>
              )}

              {/* Boutons de contrôle */}
              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleStartAttack} 
                  disabled={isRunning}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer
                </Button>
                <Button 
                  onClick={handleStopAttack} 
                  disabled={!isRunning}
                  variant="destructive"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Arrêter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statut et résultats */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Statut de l'attaque</span>
                {isRunning && <Badge variant="secondary" className="bg-green-600">En cours</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attackStatus && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Tentatives</span>
                      <span className="text-white font-mono">{attackStatus.attempts?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Temps écoulé</span>
                      <span className="text-white font-mono">{formatTime(attackStatus.elapsed_time || 0)}</span>
                    </div>
                    {attackStatus.running && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Vitesse</span>
                        <span className="text-white font-mono">
                          {attackStatus.elapsed_time > 0 
                            ? Math.round(attackStatus.attempts / attackStatus.elapsed_time).toLocaleString() 
                            : 0} tentatives/sec
                        </span>
                      </div>
                    )}
                  </div>

                  {attackStatus.running && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Progression</span>
                        <span className="text-white">En cours...</span>
                      </div>
                      <Progress value={undefined} className="bg-slate-700" />
                    </div>
                  )}

                  {attackStatus.found_password && (
                    <Alert className="border-green-500 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-200">
                        <strong>Mot de passe trouvé :</strong> {attackStatus.found_password}
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              {!attackStatus && !isRunning && (
                <div className="text-center text-slate-400 py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune attaque en cours</p>
                  <p className="text-sm">Configurez et démarrez une attaque pour voir les résultats</p>
                </div>
              )}

              {error && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App

