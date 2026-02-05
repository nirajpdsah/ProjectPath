import { useEffect, useRef, useState } from 'react'
import api from '../services/api'

interface Activity {
  id: string
  activityId: string
  name: string
  predecessors: string
  duration?: number
  optimistic?: number
  mostLikely?: number
  pessimistic?: number
  es: number
  ef: number
  ls: number
  lf: number
  slack: number
  isCritical: boolean
}

interface NetworkDiagramProps {
  projectId: string
  criticalPath: string[]
  analysisData?: any
}

interface Node {
  id: string
  x: number
  y: number
  activity?: Activity
  level: number
  isStartOrFinish?: boolean
  label?: string
}

export default function NetworkDiagram({ projectId, criticalPath, analysisData }: NetworkDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchActivities()
  }, [projectId, analysisData])

  useEffect(() => {
    if (activities.length > 0) {
      layoutNodes()
    }
  }, [activities])

  useEffect(() => {
    if (nodes.length > 0) {
      drawNetwork()
    }
  }, [nodes, hoveredNode])

  const fetchActivities = async () => {
    try {
      if (analysisData) {
        // Guest mode - use provided analysis data
        const activitiesWithAnalysis = analysisData.activities.map((activity: any) => ({
          ...activity,
          duration: activity.duration ||
            ((activity.optimistic + 4 * activity.mostLikely + activity.pessimistic) / 6)
        }))
        setActivities(activitiesWithAnalysis)
      } else {
        // Authenticated mode - fetch from API
        const response = await api.get(`/projects/${projectId}/activities`)
        const analysisResponse = await api.get(`/projects/${projectId}/analyze`)

        // Merge activity data with analysis results
        const activitiesWithAnalysis = response.data.map((activity: any) => {
          const analysisDataItem = analysisResponse.data.activities.find(
            (a: any) => a.activityId === activity.activityId
          )
          return {
            ...activity,
            ...analysisDataItem,
            duration: activity.duration ||
              ((activity.optimistic + 4 * activity.mostLikely + activity.pessimistic) / 6)
          }
        })

        setActivities(activitiesWithAnalysis)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }

  const layoutNodes = () => {
    if (activities.length === 0) return

    // Build dependency graph
    const activityMap = new Map<string, Activity>()
    activities.forEach(activity => {
      activityMap.set(activity.activityId, activity)
    })

    // Calculate levels (topological sort)
    const levels = new Map<string, number>()
    const visited = new Set<string>()

    const calculateLevel = (activityId: string): number => {
      if (visited.has(activityId)) return levels.get(activityId) || 0
      visited.add(activityId)

      const activity = activityMap.get(activityId)
      if (!activity) return 0

      const predecessorIds = activity.predecessors
        ? activity.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '—')
        : []

      if (predecessorIds.length === 0) {
        levels.set(activityId, 1) // Start from level 1 (after START node)
        return 1
      }

      const maxPredLevel = Math.max(
        ...predecessorIds.map(predId => calculateLevel(predId))
      )
      const level = maxPredLevel + 1
      levels.set(activityId, level)
      return level
    }

    // Calculate levels for all activities
    activities.forEach(activity => calculateLevel(activity.activityId))

    // Find activities with no predecessors (connect to START)
    const startActivities = activities.filter(activity => {
      const predecessorIds = activity.predecessors
        ? activity.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '—')
        : []
      return predecessorIds.length === 0
    })

    // Find activities with no successors (connect to FINISH)
    const activitySuccessors = new Map<string, string[]>()
    activities.forEach(activity => {
      const predecessorIds = activity.predecessors
        ? activity.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '—')
        : []
      predecessorIds.forEach(predId => {
        if (!activitySuccessors.has(predId)) {
          activitySuccessors.set(predId, [])
        }
        activitySuccessors.get(predId)!.push(activity.activityId)
      })
    })

    const finishActivities = activities.filter(activity =>
      !activitySuccessors.has(activity.activityId) ||
      activitySuccessors.get(activity.activityId)!.length === 0
    )

    // Group activities by level
    const levelGroups = new Map<number, Activity[]>()
    activities.forEach(activity => {
      const level = levels.get(activity.activityId) || 1
      if (!levelGroups.has(level)) {
        levelGroups.set(level, [])
      }
      levelGroups.get(level)!.push(activity)
    })

    // Calculate positions
    const maxLevel = Math.max(...Array.from(levels.values()))
    const totalLevels = maxLevel + 2 // +2 for START and FINISH
    const levelWidth = dimensions.width / (totalLevels + 1)
    const nodeWidth = 120
    const nodeHeight = 80
    const padding = 50

    const newNodes: Node[] = []

    // Add START node
    newNodes.push({
      id: 'START',
      x: padding + levelWidth / 2,
      y: dimensions.height / 2,
      level: 0,
      isStartOrFinish: true,
      label: 'START'
    })

    // Add activity nodes
    levelGroups.forEach((activitiesInLevel, level) => {
      const levelHeight = dimensions.height / (activitiesInLevel.length + 1)

      activitiesInLevel.forEach((activity, index) => {
        newNodes.push({
          id: activity.activityId,
          x: padding + level * levelWidth + levelWidth / 2,
          y: padding + (index + 1) * levelHeight,
          activity,
          level
        })
      })
    })

    // Add FINISH node
    newNodes.push({
      id: 'FINISH',
      x: padding + (maxLevel + 1) * levelWidth + levelWidth / 2,
      y: dimensions.height / 2,
      level: maxLevel + 1,
      isStartOrFinish: true,
      label: 'FINISH'
    })

    setNodes(newNodes)
  }

  const drawNetwork = () => {
    const canvas = canvasRef.current
    if (!canvas || nodes.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Draw edges first (so they appear behind nodes)
    nodes.forEach(node => {
      // Handle START node connections
      if (node.id === 'START') {
        const startActivities = nodes.filter(n =>
          n.activity && (!n.activity.predecessors ||
            n.activity.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '—').length === 0)
        )

        startActivities.forEach(targetNode => {
          const isCriticalEdge = targetNode.activity?.isCritical || false

          ctx.beginPath()
          ctx.moveTo(node.x + 40, node.y)
          ctx.lineTo(targetNode.x - 60, targetNode.y)

          ctx.strokeStyle = isCriticalEdge ? '#ef4444' : '#94a3b8' // red-500 : slate-400
          ctx.lineWidth = isCriticalEdge ? 3 : 1.5
          ctx.stroke()

          // Arrow head
          const angle = Math.atan2(targetNode.y - node.y, targetNode.x - node.x)
          const arrowSize = 10
          ctx.beginPath()
          ctx.moveTo(targetNode.x - 60, targetNode.y)
          ctx.lineTo(
            targetNode.x - 60 - arrowSize * Math.cos(angle - Math.PI / 6),
            targetNode.y - arrowSize * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(targetNode.x - 60, targetNode.y)
          ctx.lineTo(
            targetNode.x - 60 - arrowSize * Math.cos(angle + Math.PI / 6),
            targetNode.y - arrowSize * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        })
        return
      }

      // Handle FINISH node connections
      if (node.id === 'FINISH') {
        // Find activities with no successors
        const activitySuccessors = new Map<string, string[]>()
        nodes.forEach(n => {
          if (n.activity) {
            const predecessorIds = n.activity.predecessors
              ? n.activity.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '—')
              : []
            predecessorIds.forEach(predId => {
              if (!activitySuccessors.has(predId)) {
                activitySuccessors.set(predId, [])
              }
              activitySuccessors.get(predId)!.push(n.activity!.activityId)
            })
          }
        })

        const finishActivities = nodes.filter(n =>
          n.activity && (!activitySuccessors.has(n.activity.activityId) ||
            activitySuccessors.get(n.activity.activityId)!.length === 0)
        )

        finishActivities.forEach(sourceNode => {
          const isCriticalEdge = sourceNode.activity?.isCritical || false

          ctx.beginPath()
          ctx.moveTo(sourceNode.x + 60, sourceNode.y)
          ctx.lineTo(node.x - 40, node.y)

          ctx.strokeStyle = isCriticalEdge ? '#ef4444' : '#94a3b8'
          ctx.lineWidth = isCriticalEdge ? 3 : 1.5
          ctx.stroke()

          // Arrow head
          const angle = Math.atan2(node.y - sourceNode.y, node.x - sourceNode.x)
          const arrowSize = 10
          ctx.beginPath()
          ctx.moveTo(node.x - 40, node.y)
          ctx.lineTo(
            node.x - 40 - arrowSize * Math.cos(angle - Math.PI / 6),
            node.y - arrowSize * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(node.x - 40, node.y)
          ctx.lineTo(
            node.x - 40 - arrowSize * Math.cos(angle + Math.PI / 6),
            node.y - arrowSize * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        })
        return
      }

      // Regular activity edges
      if (!node.activity) return

      const predecessorIds = node.activity.predecessors
        ? node.activity.predecessors.split(',').map(p => p.trim()).filter(p => p && p !== '—')
        : []

      predecessorIds.forEach(predId => {
        const predNode = nodes.find(n => n.id === predId)
        if (predNode) {
          const isCriticalEdge =
            criticalPath.includes(predNode.id) &&
            criticalPath.includes(node.id) &&
            criticalPath.indexOf(node.id) === criticalPath.indexOf(predNode.id) + 1

          ctx.beginPath()
          ctx.moveTo(predNode.x + 60, predNode.y)
          ctx.lineTo(node.x - 60, node.y)

          // Style based on critical path
          if (isCriticalEdge) {
            ctx.strokeStyle = '#ef4444' // red-500
            ctx.lineWidth = 3
          } else {
            ctx.strokeStyle = '#94a3b8' // slate-400
            ctx.lineWidth = 1.5
          }

          ctx.stroke()

          // Draw arrow head
          const angle = Math.atan2(node.y - predNode.y, node.x - predNode.x)
          const arrowSize = 10
          ctx.beginPath()
          ctx.moveTo(node.x - 60, node.y)
          ctx.lineTo(
            node.x - 60 - arrowSize * Math.cos(angle - Math.PI / 6),
            node.y - arrowSize * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(node.x - 60, node.y)
          ctx.lineTo(
            node.x - 60 - arrowSize * Math.cos(angle + Math.PI / 6),
            node.y - arrowSize * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      })
    })

    // Draw nodes
    nodes.forEach(node => {
      const isHovered = hoveredNode === node.id

      // Draw START/FINISH nodes as circles
      if (node.isStartOrFinish) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, 40, 0, 2 * Math.PI)

        ctx.fillStyle = isHovered ? '#eef2ff' : '#f8fafc' // primary-50 : slate-50
        ctx.strokeStyle = '#6366f1' // primary-500
        ctx.lineWidth = 2

        ctx.fill()
        ctx.stroke()

        // Label
        ctx.font = 'bold 14px "Inter", sans-serif'
        ctx.fillStyle = '#1e293b' // slate-800
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.label || node.id, node.x, node.y)

        return
      }

      // Regular activity nodes
      if (!node.activity) return

      const isCritical = criticalPath.includes(node.id)

      // Node background
      ctx.beginPath()
      ctx.roundRect(node.x - 60, node.y - 40, 120, 80, 12)

      if (isCritical) {
        ctx.fillStyle = isHovered ? '#fef2f2' : '#ffffff' // red-50 : white
        ctx.strokeStyle = '#ef4444' // red-500
        ctx.lineWidth = 2
      } else {
        ctx.fillStyle = isHovered ? '#f8fafc' : '#ffffff' // slate-50 : white
        ctx.strokeStyle = '#6366f1' // primary-500
        ctx.lineWidth = 2
      }

      ctx.fill()
      ctx.stroke()

      // Activity ID
      ctx.font = 'bold 16px "Inter", sans-serif'
      ctx.fillStyle = isCritical ? '#dc2626' : '#334155' // red-600 : slate-700
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(node.activity.activityId, node.x, node.y - 15)

      // Activity name (truncated)
      ctx.font = '12px "Inter", sans-serif'
      ctx.fillStyle = '#64748b' // slate-500
      const name = node.activity.name.length > 12
        ? node.activity.name.substring(0, 10) + '...'
        : node.activity.name
      ctx.fillText(name, node.x, node.y + 5)

      // Duration
      ctx.font = '11px "Inter", sans-serif'
      ctx.fillStyle = '#94a3b8' // slate-400
      const duration = node.activity.duration?.toFixed(1) || 'N/A'
      ctx.fillText(`t = ${duration}`, node.x, node.y + 20)
    })

    // Draw legend
    drawLegend(ctx)
  }

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendX = 20
    const legendY = dimensions.height - 80

    // Background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.strokeStyle = '#e2e8f0' // slate-200
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(legendX, legendY, 200, 60, 8)
    ctx.fill()
    ctx.stroke()

    // Critical path line
    ctx.beginPath()
    ctx.moveTo(legendX + 15, legendY + 20)
    ctx.lineTo(legendX + 45, legendY + 20)
    ctx.strokeStyle = '#ef4444' // red-500
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.font = '12px "Inter", sans-serif'
    ctx.fillStyle = '#1e293b' // slate-800
    ctx.textAlign = 'left'
    ctx.fillText('Critical Path', legendX + 55, legendY + 24)

    // Non-critical line
    ctx.beginPath()
    ctx.moveTo(legendX + 15, legendY + 45)
    ctx.lineTo(legendX + 45, legendY + 45)
    ctx.strokeStyle = '#94a3b8' // slate-400
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.fillText('Non-Critical', legendX + 55, legendY + 49)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find clicked node
    for (const node of nodes) {
      let isHit = false
      if (node.isStartOrFinish) {
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
        isHit = distance <= 40
      } else {
        isHit = x >= node.x - 60 && x <= node.x + 60 && y >= node.y - 40 && y <= node.y + 40
      }

      if (isHit) {
        setIsDragging(true)
        setDraggedNodeId(node.id)
        setDragOffset({ x: x - node.x, y: y - node.y })
        break
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedNodeId(null)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Handle dragging
    if (isDragging && draggedNodeId) {
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === draggedNodeId
            ? { ...node, x: x - dragOffset.x, y: y - dragOffset.y }
            : node
        )
      )
      return
    }

    // Check if hovering over any node
    let hoveredNodeId: string | null = null

    for (const node of nodes) {
      if (node.isStartOrFinish) {
        // Circle nodes (START/FINISH)
        const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2)
        if (distance <= 40) {
          hoveredNodeId = node.id
          break
        }
      } else {
        // Rectangle nodes (activities)
        if (x >= node.x - 60 && x <= node.x + 60 &&
          y >= node.y - 40 && y <= node.y + 40) {
          hoveredNodeId = node.id
          break
        }
      }
    }

    setHoveredNode(hoveredNodeId)

    // Update cursor style
    if (hoveredNodeId) {
      canvas.style.cursor = 'move'
    } else {
      canvas.style.cursor = 'default'
    }
  }

  const handleMouseLeave = () => {
    setHoveredNode(null)
    setIsDragging(false)
    setDraggedNodeId(null)
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-secondary-900">Network Diagram</h2>
        <button
          onClick={layoutNodes}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Layout
        </button>
      </div>
      <div className="mb-4 text-sm text-secondary-600 bg-secondary-50 border border-secondary-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="mr-2">💡</span>
          <strong>Tip:</strong><span className="ml-1">Drag any node to reposition it. Click "Reset Layout" to restore the automatic layout.</span>
        </div>
        <button
          onClick={() => setDimensions({ width: 1200, height: 600 })}
          className="px-3 py-1 text-xs font-medium bg-white border border-secondary-300 rounded hover:bg-secondary-50 transition-colors"
        >
          Reset View
        </button>
      </div>

      <div className="border border-secondary-200 rounded-xl overflow-auto bg-slate-50 shadow-inner">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-pointer"
        />
      </div>

      {hoveredNode && hoveredNode !== 'START' && hoveredNode !== 'FINISH' && (
        <div className="mt-4 p-4 bg-white border border-secondary-200 rounded-xl shadow-lg animate-fade-in-up">
          {(() => {
            const node = nodes.find(n => n.id === hoveredNode)
            if (!node || !node.activity) return null
            return (
              <div className="text-sm">
                <p className="font-semibold text-secondary-900 text-base mb-2 flex items-center">
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded mr-2">{node.activity.activityId}</span>
                  {node.activity.name}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-6 text-xs">
                  <div><span className="text-secondary-500">Early Start:</span> <span className="font-mono font-medium ml-1">{node.activity.es.toFixed(2)}</span></div>
                  <div><span className="text-secondary-500">Early Finish:</span> <span className="font-mono font-medium ml-1">{node.activity.ef.toFixed(2)}</span></div>
                  <div><span className="text-secondary-500">Late Start:</span> <span className="font-mono font-medium ml-1">{node.activity.ls.toFixed(2)}</span></div>
                  <div><span className="text-secondary-500">Late Finish:</span> <span className="font-mono font-medium ml-1">{node.activity.lf.toFixed(2)}</span></div>
                  <div><span className="text-secondary-500">Slack:</span> <span className="font-mono font-medium ml-1">{node.activity.slack.toFixed(2)}</span></div>
                  <div>
                    <span className="text-secondary-500">Status:</span>
                    <span className={`font-bold ml-1 ${node.activity.isCritical ? 'text-danger-600' : 'text-success-600'}`}>
                      {node.activity.isCritical ? 'Critical' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
