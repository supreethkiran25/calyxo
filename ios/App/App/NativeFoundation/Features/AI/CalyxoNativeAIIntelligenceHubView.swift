//
//  CalyxoNativeAIIntelligenceHubView.swift
//  Calyxo Native AI Coach Experience
//
//  Production-Grade SwiftUI AI Intelligence Hub & Coach.
//  Interactive conversation thread, grounded context chips, and native chat input.
//  Supports adaptive Light & Dark mode contrast.
//

import SwiftUI

public struct CalyxoNativeAIIntelligenceHubView: View {
    @ObservedObject private var aiService = CalyxoNativeAIService.shared
    @State private var inputPrompt: String = ""
    
    public init() {}
    
    public var body: some View {
        VStack(spacing: 0) {
            // Top Bar
            HStack {
                HStack(spacing: 8) {
                    Circle()
                        .fill(CalyxoDesignTokens.Colors.accentAcid)
                        .frame(width: 8, height: 8)
                    Text("CALYXO AI COACH")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                        .tracking(1)
                }
                Spacer()
                Button(action: { aiService.clearConversation() }) {
                    Image(systemName: "trash")
                        .font(.system(size: 13))
                        .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                        .padding(6)
                }
            }
            .padding()
            .background(CalyxoDesignTokens.Colors.surface)
            
            // Conversation Scroll Area
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(spacing: 16) {
                        ForEach(aiService.messages) { msg in
                            messageBubble(msg: msg)
                                .id(msg.id)
                        }
                        
                        if aiService.isLoading {
                            HStack {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: CalyxoDesignTokens.Colors.accentAcid))
                                Text("Analyzing training telemetry...")
                                    .font(.system(size: 12))
                                    .foregroundColor(CalyxoDesignTokens.Colors.textSecondary)
                                Spacer()
                            }
                            .padding(.horizontal)
                        }
                    }
                    .padding()
                }
                .onChange(of: aiService.messages.count) { _ in
                    if let lastMsg = aiService.messages.last {
                        withAnimation {
                            proxy.scrollTo(lastMsg.id, anchor: .bottom)
                        }
                    }
                }
            }
            
            // Quick Prompt Chips
            quickPromptChips
            
            // Chat Input Bar
            chatInputBar
        }
        .background(CalyxoDesignTokens.Colors.background.ignoresSafeArea())
    }
    
    // MARK: - Message Bubble
    private func messageBubble(msg: CalyxoNativeAIService.ChatMessage) -> some View {
        HStack {
            if msg.role == "user" { Spacer() }
            
            Text(msg.text)
                .font(.system(size: 14))
                .foregroundColor(msg.role == "user" ? .black : CalyxoDesignTokens.Colors.textPrimary)
                .padding(14)
                .background(msg.role == "user" ? CalyxoDesignTokens.Colors.accentAcid : CalyxoDesignTokens.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(msg.role == "user" ? Color.clear : CalyxoDesignTokens.Colors.cardBorder, lineWidth: 1)
                )
                .cornerRadius(16)
                .frame(maxWidth: 280, alignment: msg.role == "user" ? .trailing : .leading)
            
            if msg.role == "assistant" { Spacer() }
        }
    }
    
    // MARK: - Quick Prompt Chips
    private var quickPromptChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                promptChip(title: "Analyze today's macros", query: "Analyze my consumed macros vs daily goal")
                promptChip(title: "How is my recovery?", query: "How is my recovery score and training readiness today?")
                promptChip(title: "Review workout volume", query: "Review my recent workout volume and muscle stimulus")
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
    }
    
    private func promptChip(title: String, query: String) -> some View {
        Button(action: {
            aiService.sendMessage(prompt: query)
        }) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
                .cornerRadius(20)
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(CalyxoDesignTokens.Colors.cardBorder, lineWidth: 1)
                )
        }
    }
    
    // MARK: - Chat Input Bar
    private var chatInputBar: some View {
        HStack(spacing: 10) {
            TextField("Ask Calyxo AI anything...", text: $inputPrompt)
                .padding(12)
                .background(CalyxoDesignTokens.Colors.surfaceSubtle)
                .cornerRadius(12)
                .foregroundColor(CalyxoDesignTokens.Colors.textPrimary)
            
            Button(action: {
                let prompt = inputPrompt
                inputPrompt = ""
                aiService.sendMessage(prompt: prompt)
            }) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(inputPrompt.isEmpty ? CalyxoDesignTokens.Colors.textSecondary : CalyxoDesignTokens.Colors.accentAcid)
            }
            .disabled(inputPrompt.isEmpty)
        }
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(CalyxoDesignTokens.Colors.surface)
    }
}
