import WidgetKit
import SwiftUI

@main
struct CalyxoWidgetBundle: WidgetBundle {
    var body: some Widget {
        HydrationWidget()
        NutritionWidget()
        ActivityWidget()
        if #available(iOS 16.1, *) {
            CalyxoLiveActivityWidget()
        }
    }
}
